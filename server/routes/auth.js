import { Router } from 'express';
import { register, login, me, refreshToken, forgotPassword, getProviders } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.get('/me', authenticate, me);
router.get('/providers', getProviders);
export default router;
