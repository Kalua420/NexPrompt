import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, adminLogin, me, refreshToken, logout, forgotPassword, resetPassword, getProviders, updateProfile, verifyEmail, resendVerification, googleAuth } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many password reset requests. Please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();
router.post('/register',           authLimiter, register);
router.post('/login',              authLimiter, login);
router.post('/admin/login',        authLimiter, adminLogin);
router.post('/google',             authLimiter, googleAuth);
router.post('/verify-email',       verifyEmail);
router.post('/resend-verification',authLimiter, resendVerification);
router.post('/refresh',            refreshToken);
router.post('/logout',             authenticate, logout);
router.post('/forgot-password',    forgotPasswordLimiter, forgotPassword);
router.post('/reset-password',     authLimiter, resetPassword);
router.get('/me',                  authenticate, me);
router.patch('/profile',           authenticate, updateProfile);
router.get('/providers',           getProviders);
export default router;
