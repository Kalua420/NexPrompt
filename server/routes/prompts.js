import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getPrompts, getPrompt, createPrompt, deletePrompt, refinePrompt, generatePrompt } from '../controllers/promptController.js';

const router = Router();
router.use(authenticate);
router.get('/', getPrompts);
router.get('/:id', getPrompt);
router.post('/', createPrompt);
router.delete('/:id', deletePrompt);
router.post('/refine', refinePrompt);
router.post('/generate', generatePrompt);

export default router;
