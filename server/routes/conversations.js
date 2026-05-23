import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getConversations, getConversation, createConversation, deleteConversation, updateConversation } from '../controllers/conversationController.js';

const router = Router();
router.use(authenticate);
router.get('/', getConversations);
router.get('/:id', getConversation);
router.post('/', createConversation);
router.delete('/:id', deleteConversation);
router.patch('/:id', updateConversation);

export default router;
