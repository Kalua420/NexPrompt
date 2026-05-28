import { Router } from 'express';
import { register, login, adminLogin, me, refreshToken, logout, forgotPassword, resetPassword, getProviders, updateProfile, verifyEmail, resendVerification, googleAuth } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.post('/google', googleAuth);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authenticate, me);
router.patch('/profile', authenticate, updateProfile);
router.get('/providers', getProviders);
export default router;
