import { Request, Response, NextFunction } from 'express';
import { questionService } from '../services/question.service';
import { success } from '../utils/api-response';

// Ensure the global Request type extension from auth.middleware is recognized
import '../middleware/auth.middleware';

/**
 * HTTP handlers for question endpoints.
 */
export const questionController = {

  /**
   * GET /api/questions
   * Returns paginated list of questions with optional filters.
   */
  async getQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as any)?.userId;
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
      
      const filter = {
        subject: req.query.subject as string | undefined,
        level: req.query.level as string | undefined,
        topic: req.query.topic as string | undefined,
        examYear: req.query.examYear ? Number(req.query.examYear) : undefined,
        isVerified: req.query.isVerified === 'true' ? true : undefined,
      };

      const result = await questionService.getQuestions(filter, { page, limit });
      res.json(success(result));
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/questions/:id
   * Returns a single question by ID.
   */
  async getQuestionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const userId = req.user?.userId;

      const question = await questionService.getQuestionById(id, userId);
      res.json(success({ question }));
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/questions/:id/submit
   * Submits an answer for a question and records progress.
   */
  async submitAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const userId = (req.user as any).userId;
      const { answerIndex, timeSpentSeconds } = req.body;

      const result = await questionService.submitAnswer(userId, id, answerIndex, timeSpentSeconds || 0);
      res.json(success(result));
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/questions/search
   * Full-text search for questions.
   */
  async searchQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = (req.query.q as string) || '';
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
      
      const filter = {
        subject: req.query.subject as string | undefined,
        level: req.query.level as string | undefined,
        topic: req.query.topic as string | undefined,
      };

      const result = await questionService.searchQuestions(query, filter, { page, limit });
      res.json(success(result));
    } catch (err) {
      next(err);
    }
  },
};
