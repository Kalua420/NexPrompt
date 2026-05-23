import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../src/index.js';
import { generateAccessToken, generateRefreshToken } from '../utils/tokens.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation: min 8 chars, at least one uppercase, one lowercase, one number
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!PASSWORD_RE.test(password)) {
    return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
  }
  return null;
}

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  if (typeof name !== 'string' || name.length < 1 || name.length > 100) return res.status(400).json({ error: 'Name must be 1-100 characters' });
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) return res.status(400).json({ error: 'Invalid email format' });
  
  const passwordError = validatePassword(password);
  if (passwordError) return res.status(400).json({ error: passwordError });
  
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });
  
  // Create free subscription by default
  await prisma.subscription.create({
    data: {
      userId: user.id,
      plan: 'free',
      status: 'active',
    },
  });
  
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, plan: 'free' }, accessToken, refreshToken });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Invalid credentials' });
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  const sub = await prisma.subscription.findUnique({ where: { userId: user.id } });
  res.json({ user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, plan: sub?.plan || 'free' }, accessToken, refreshToken });
}

export async function me(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { id: true, name: true, email: true, avatar: true, createdAt: true } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const sub = await prisma.subscription.findUnique({ where: { userId: user.id } });
  res.json({ ...user, plan: sub?.plan || 'free' });
}

export async function refreshToken(req, res) {
  const { refreshToken: token } = req.body;
  if (!token) return res.status(400).json({ error: 'Refresh token required' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(401).json({ error: 'User not found' });
    const accessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);
    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
}

export async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    console.log(`Password reset requested for ${email}`);
  }
  res.json({ message: 'If that email is registered, reset instructions have been sent.' });
}

const PROVIDER_ENV_KEYS = {
  groq: 'GROQ_API_KEY',
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  opencode: 'OPENCODE_API_KEY',
  gemini: 'GEMINI_API_KEY',
};

export async function getProviders(req, res) {
  const providers = Object.entries(PROVIDER_ENV_KEYS)
    .filter(([, key]) => process.env[key] && process.env[key].trim().length > 0)
    .map(([name]) => name);
  res.json({ providers });
}
