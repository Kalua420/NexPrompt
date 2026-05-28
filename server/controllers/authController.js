import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../src/index.js';
import { generateAccessToken, generateRefreshToken } from '../utils/tokens.js';
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordResetConfirmation,
  sendEmailVerification,
} from '../services/emailService.js';
import { getOrCreateCreditBalance, addCredits } from '../services/creditService.js';
import { getAvailableProviders } from '../services/apiKeyService.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const SIGNUP_BONUS_CREDITS = 5;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!PASSWORD_RE.test(password)) {
    return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
  }
  return null;
}

async function getUserPlan(userId) {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  return sub?.plan || 'free';
}

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  if (typeof name !== 'string' || name.length < 1 || name.length > 100) return res.status(400).json({ error: 'Name must be 1-100 characters' });
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) return res.status(400).json({ error: 'Invalid email format' });

  const passwordError = validatePassword(password);
  if (passwordError) return res.status(400).json({ error: passwordError });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    // If account exists but is unverified, allow resending the verification email
    if (!exists.emailVerified) {
      const verificationToken = crypto.randomBytes(32).toString('hex');
      await prisma.user.update({
        where: { id: exists.id },
        data: { verificationToken },
      });
      sendEmailVerification(exists, verificationToken).catch((err) =>
        console.error('Failed to resend verification email:', err.message)
      );
      return res.status(409).json({
        error: 'Email already registered but not verified. A new verification email has been sent.',
        requiresVerification: true,
      });
    }
    return res.status(409).json({ error: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date();
  const verificationToken = crypto.randomBytes(32).toString('hex');

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      termsAcceptedAt: now,
      privacyAcceptedAt: now,
      emailVerified: false,
      verificationToken,
    },
  });

  // Send verification email (non-blocking)
  sendEmailVerification(user, verificationToken).catch((err) =>
    console.error('Failed to send verification email:', err.message)
  );

  // Return without tokens — user must verify email first
  res.status(201).json({
    requiresVerification: true,
    message: 'Account created. Please check your email to verify your account before logging in.',
  });
}

export async function verifyEmail(req, res) {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Verification token required' });

  const user = await prisma.user.findUnique({ where: { verificationToken: token } });
  if (!user) return res.status(400).json({ error: 'Invalid or expired verification link' });
  if (user.emailVerified) return res.status(400).json({ error: 'Email already verified' });

  // Mark verified and clear token
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verificationToken: null },
  });

  // Grant signup credits now that email is confirmed
  await getOrCreateCreditBalance(user.id);
  const balance = await addCredits(user.id, SIGNUP_BONUS_CREDITS, 'bonus', 'Welcome bonus — email verified');

  // Send welcome email (non-blocking)
  sendWelcomeEmail(user, balance).catch((err) =>
    console.error('Failed to send welcome email:', err.message)
  );

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = await generateRefreshToken(user.id);
  res.cookie('refreshToken', refreshToken, COOKIE_OPTS);

  res.json({
    message: 'Email verified successfully.',
    user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, role: user.role, plan: await getUserPlan(user.id) },
    credits: balance,
    accessToken,
    refreshToken,
  });
}

export async function resendVerification(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (user && !user.emailVerified) {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
    });
    sendEmailVerification(user, verificationToken).catch((err) =>
      console.error('Failed to resend verification email:', err.message)
    );
  }

  res.json({ message: 'If that email is registered and unverified, a new verification link has been sent.' });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Block unverified accounts (skip for admin users)
  if (!user.emailVerified && user.role !== 'admin') {
    return res.status(403).json({
      error: 'Please verify your email address before logging in.',
      requiresVerification: true,
      email: user.email,
    });
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = await generateRefreshToken(user.id);
  res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
  res.json({
    user: {
      id: user.id, name: user.name, email: user.email, avatar: user.avatar, role: user.role,
      googleId: user.googleId || null, hasPassword: !!user.passwordHash,
      plan: await getUserPlan(user.id),
    },
    accessToken,
    refreshToken,
  });
}

export async function adminLogin(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = await generateRefreshToken(user.id);
  res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
  res.json({
    user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, role: user.role },
    accessToken, refreshToken,
  });
}

export async function me(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { id: true, name: true, email: true, avatar: true, role: true, createdAt: true, googleId: true, passwordHash: true },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ ...user, passwordHash: undefined, hasPassword: !!user.passwordHash, plan: await getUserPlan(user.id) });
}

export async function refreshToken(req, res) {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (!token) return res.status(400).json({ error: 'Refresh token required' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hash } });
    if (!stored || stored.expiresAt < new Date()) {
      await prisma.refreshToken.deleteMany({ where: { tokenHash: hash } });
      return res.status(401).json({ error: 'Token revoked or expired' });
    }
    await prisma.refreshToken.delete({ where: { tokenHash: hash } });
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(401).json({ error: 'User not found' });
    const accessToken = generateAccessToken(user.id, user.role);
    const newRefreshToken = await generateRefreshToken(user.id);
    res.cookie('refreshToken', newRefreshToken, COOKIE_OPTS);
    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
}

export async function logout(req, res) {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (token) {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    await prisma.refreshToken.deleteMany({ where: { tokenHash: hash } }).catch(() => {});
  }
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json({ message: 'Logged out' });
}

export async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (user) {
    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    
    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });
    
    // Send password reset email (non-blocking)
    sendPasswordResetEmail(user, resetToken).catch(err => 
      console.error('Failed to send password reset email:', err.message)
    );
    
    console.log(`✓ Password reset requested for ${email}`);
  }
  
  // Always return success to prevent email enumeration
  res.json({ message: 'If that email is registered, reset instructions have been sent.' });
}

export async function resetPassword(req, res) {
  const { token, password } = req.body;
  
  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password required' });
  }
  
  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ error: passwordError });
  }
  
  // Find user with valid reset token
  const user = await prisma.user.findUnique({
    where: { resetToken: token },
  });
  
  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }
  
  // Hash new password
  const passwordHash = await bcrypt.hash(password, 12);
  
  // Update password and clear reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });
  
  // Send confirmation email (non-blocking)
  sendPasswordResetConfirmation(user).catch(err => 
    console.error('Failed to send password reset confirmation:', err.message)
  );
  
  console.log(`✓ Password reset completed for ${user.email}`);
  
  res.json({ message: 'Password reset successful. You can now login with your new password.' });
}

export async function getProviders(req, res) {
  const providers = await getAvailableProviders();
  res.json({ providers });
}

export async function updateProfile(req, res) {
  try {
    const { name, avatar, currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const data = {};

    // Name update
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 100) {
        return res.status(400).json({ error: 'Name must be 1–100 characters' });
      }
      data.name = name.trim();
    }

    // Avatar update — accept https URLs only; reject base64 data URLs
    if (avatar !== undefined) {
      if (avatar === null || avatar === '') {
        data.avatar = null;
      } else if (typeof avatar === 'string') {
        if (avatar.startsWith('data:')) {
          return res.status(400).json({
            error: 'Base64 image uploads are not supported. Upload the image to object storage and provide the URL.',
          });
        }
        if (!avatar.startsWith('https://')) {
          return res.status(400).json({ error: 'Avatar must be an https:// URL' });
        }
        data.avatar = avatar;
      }
    }

    // Password change
    if (newPassword !== undefined) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to set a new password' });
      }
      if (!user.passwordHash) {
        return res.status(400).json({ error: 'This account uses Google sign-in. Set a password via forgot-password.' });
      }
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      const passwordError = validatePassword(newPassword);
      if (passwordError) return res.status(400).json({ error: passwordError });
      data.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'No changes provided' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, avatar: true, role: true },
    });

    res.json({ user: { ...updated, plan: await getUserPlan(userId) } });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

export async function googleAuth(req, res) {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'Google credential required' });

  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(503).json({ error: 'Google sign-in is not configured on this server' });
  }

  // credential may be either:
  //   - an OAuth2 access_token (from useGoogleLogin implicit flow) — fetch userinfo
  //   - a JWT id_token (from GoogleLogin one-tap) — verify directly
  //   Access tokens start with "ya29." or are short; id_tokens are 3-part JWTs (contain two dots)
  let googleId, email, name, picture;

  const isIdToken = credential.split('.').length === 3 && !credential.startsWith('ya29.');

  if (!isIdToken) {
    // OAuth2 access token — fetch profile from Google userinfo endpoint
    try {
      const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${credential}` },
      });
      if (!r.ok) throw new Error(`Userinfo request failed: ${r.status}`);
      const info = await r.json();
      googleId = info.sub;
      email    = info.email;
      name     = info.name;
      picture  = info.picture;
    } catch {
      return res.status(401).json({ error: 'Invalid Google access token' });
    }
  } else {
    // JWT id_token — verify with google-auth-library
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const p = ticket.getPayload();
      googleId = p.sub;
      email    = p.email;
      name     = p.name;
      picture  = p.picture;
    } catch {
      return res.status(401).json({ error: 'Invalid Google credential' });
    }
  }

  if (!email) return res.status(400).json({ error: 'Google account has no email address' });

  // 1. Try to find by googleId first (returning user)
  let user = await prisma.user.findUnique({ where: { googleId } });

  if (!user) {
    // 2. Try to find by email — link existing account
    user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Link Google to the existing email/password account
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          emailVerified: true,
          // Only update avatar if the user hasn't set one
          ...(user.avatar ? {} : { avatar: picture || null }),
        },
      });
    } else {
      // 3. New user — create account (no password, email pre-verified)
      user = await prisma.user.create({
        data: {
          name: name || email.split('@')[0],
          email,
          googleId,
          avatar: picture || null,
          emailVerified: true,
          termsAcceptedAt: new Date(),
          privacyAcceptedAt: new Date(),
        },
      });

      // Grant signup bonus credits
      await getOrCreateCreditBalance(user.id);
      const balance = await addCredits(user.id, SIGNUP_BONUS_CREDITS, 'bonus', 'Welcome bonus — Google sign-in');

      // Send welcome email (non-blocking)
      sendWelcomeEmail(user, balance).catch((err) =>
        console.error('Failed to send welcome email:', err.message)
      );

      console.log(`✓ New user registered via Google: ${email}`);
    }
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = await generateRefreshToken(user.id);
  res.cookie('refreshToken', refreshToken, COOKIE_OPTS);

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      googleId: user.googleId || null,
      hasPassword: !!user.passwordHash,
      plan: await getUserPlan(user.id),
    },
    accessToken,
    refreshToken,
  });
}
