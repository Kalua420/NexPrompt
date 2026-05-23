import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getFavorites, addFavorite, removeFavorite } from '../controllers/favoriteController.js';

const router = Router();
router.use(authenticate);
router.get('/', getFavorites);
router.post('/:promptId', addFavorite);
router.delete('/:promptId', removeFavorite);

export default router;
