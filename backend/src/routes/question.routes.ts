import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';
import { questionController } from '../controllers/question.controller';

const router = Router();

// ============================================================
// Validation Schemas
// ============================================================

const paginationQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  subject: z.string().optional(),
  level: z.enum(['آسان', 'متوسط', 'سخت']).optional(),
  topic: z.string().optional(),
  examYear: z.string().optional(),
  isVerified: z.enum(['true', 'false']).optional(),
});

const submitAnswerSchema = z.object({
  answerIndex: z.number().int().min(0, 'شماره گزینه باید عدد مثبت باشد').max(3, 'گزینه باید بین ۰ تا ۳ باشد'),
  timeSpentSeconds: z.number().int().optional(),
});

const searchQuerySchema = z.object({
  q: z.string().min(1, 'عبارت جستجو نمی‌تواند خالی باشد').max(100, 'عبارت جستجو طولانی است'),
  page: z.string().optional(),
  limit: z.string().optional(),
  subject: z.string().optional(),
  level: z.enum(['آسان', 'متوسط', 'سخت']).optional(),
});

const uuidParamSchema = z.object({
  id: z.string().uuid('شناسه سوال معتبر نیست'),
});

// ============================================================
// Routes
// ============================================================

// GET /api/questions — List all questions with optional filters
router.get(
  '/',
  authenticate,
  questionController.getQuestions
);

// GET /api/questions/search — Search questions
router.get(
  '/search',
  authenticate,
  questionController.searchQuestions
);

// GET /api/questions/:id — Get single question
router.get(
  '/:id',
  authenticate,
  questionController.getQuestionById
);

// POST /api/questions/:id/submit — Submit answer for a question
router.post(
  '/:id/submit',
  authenticate,
  validate(submitAnswerSchema),
  questionController.submitAnswer
);

export default router;
