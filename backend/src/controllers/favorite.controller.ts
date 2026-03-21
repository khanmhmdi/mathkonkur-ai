import { Request, Response, NextFunction } from 'express';
import { favoriteRepository } from '../repositories/favorite.repository';
import { success } from '../utils/api-response';

// Ensure the global Request type extension from auth.middleware is recognized
import '../middleware/auth.middleware';

/**
 * HTTP handlers for favorite endpoints.
 */
export const favoriteController = {

  /**
   * GET /api/favorites
   * Returns paginated list of user's favorite questions.
   */
  async getFavorites(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as any).userId;
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

      const result = await favoriteRepository.findByUser(userId, page, limit);
      res.json(success(result));
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/favorites
   * Adds a question to favorites.
   */
  async addFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as any).userId;
      const { questionId, notes } = req.body;

      const result = await favoriteRepository.toggle(userId, questionId, notes);
      
      // toggle returns { added: true } when added, { added: false } when removed
      // For POST endpoint, we always add (or confirm it's added)
      if (result.added) {
        res.status(201).json(success({ favorite: { questionId, notes } }));
      } else {
        // Already exists, return it as existing
        res.status(200).json(success({ 
          favorite: { questionId, notes },
          message: 'Already in favorites'
        }));
      }
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/favorites/:questionId
   * Removes a question from favorites.
   */
  async removeFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as any).userId;
      const questionId = String(req.params.questionId);

      await favoriteRepository.toggle(userId, questionId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/favorites/:questionId
   * Updates the note on a favorite.
   */
  async updateNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as any).userId;
      const questionId = String(req.params.questionId);
      const { notes } = req.body;

      const favorite = await favoriteRepository.updateNote(userId, questionId, notes);
      res.json(success({ favorite }));
    } catch (err) {
      next(err);
    }
  },
};
