import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';
import { favoriteController } from '../controllers/favorite.controller';

const router = Router();

// ============================================================
// Validation Schemas
// ============================================================

const addFavoriteSchema = z.object({
  questionId: z.string().uuid('شناسه سوال معتبر نیست'),
  notes: z.string().max(1000, 'یادداشت نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد').optional(),
});

const updateNoteSchema = z.object({
  notes: z.string().min(1, 'یادداشت نمی‌تواند خالی باشد').max(1000, 'یادداشت نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد'),
});

// ============================================================
// Routes
// ============================================================

// GET /api/favorites — List user's favorites
router.get(
  '/',
  authenticate,
  favoriteController.getFavorites
);

// POST /api/favorites — Add a favorite
router.post(
  '/',
  authenticate,
  validate(addFavoriteSchema),
  favoriteController.addFavorite
);

// DELETE /api/favorites/:questionId — Remove a favorite
router.delete(
  '/:questionId',
  authenticate,
  favoriteController.removeFavorite
);

// PATCH /api/favorites/:questionId — Update favorite note
router.patch(
  '/:questionId',
  authenticate,
  validate(updateNoteSchema),
  favoriteController.updateNote
);

export default router;
