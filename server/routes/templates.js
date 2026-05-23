import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { getTemplates, createTemplate } from '../controllers/templateController.js';

const router = Router();
router.get('/', optionalAuth, getTemplates);
router.post('/', authenticate, createTemplate);

export default router;
