import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { visitorPromptLimit } from '../middleware/visitor-limit.middleware';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';
import { chatController } from '../controllers/chat.controller';

const router = Router();

// ============================================================
// Validation Schemas
// ============================================================

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const createConversationSchema = z.object({
  initialMessage: z.string().min(1, 'پیام نمی‌تواند خالی باشد').max(2000, 'پیام نباید بیشتر از ۲۰۰۰ حرف باشد'),
  subject: z.enum([
    'جبر و توابع',
    'معادله و نامعادله',
    'توابع و نمودارها',
    'مثلثات',
    'هندسه تحلیلی',
    'بردارها و هندسه',
    'حسابان',
    'گسسته و احتمال'
  ], { errorMap: () => ({ message: 'مبحث انتخابی معتبر نیست' }) }),
  level: z.enum(['ریاضی فیزیک', 'علوم تجربی', 'انسانی و معارف'], {
    errorMap: () => ({ message: 'سطح انتخابی معتبر نیست' })
  }),
  image: z.union([
    z.object({
      data: z.string().min(1, 'داده تصویر نمی‌تواند خالی باشد'),
      mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp'])
    }),
    z.string()
  ]).optional()
});

const sendMessageSchema = z.object({
  content: z.string().min(1, 'محتوای پیام نمی‌تواند خالی باشد').max(4000, 'پیام نباید بیشتر از ۴۰۰۰ حرف باشد'),
  image: z.union([
    z.object({
      data: z.string().min(1),
      mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp'])
    }),
    z.string()
  ]).optional()
});

const paginationSchema = z.object({
  page: z.string().optional().transform(v => Math.max(1, Number(v || '1'))),
  limit: z.string().optional().transform(v => Math.min(100, Math.max(1, Number(v || '20'))))
});

const conversationIdSchema = z.object({
  conversationId: z.string().regex(uuidRegex, 'شناسه مکالمه معتبر نیست')
});

// ============================================================
// Routes
// ============================================================

// POST /api/chat — Create a new conversation (visitors allowed with limit)
router.post(
  '/',
  visitorPromptLimit,
  validate(createConversationSchema),
  chatController.createConversation
);

// POST /api/chat/:conversationId/message — Send a message (visitors allowed with limit)
router.post(
  '/:conversationId/message',
  visitorPromptLimit,
  validate(sendMessageSchema),
  chatController.sendMessage
);

// GET /api/chat — List all conversations for current user
router.get(
  '/',
  authenticate,
  chatController.getConversations
);

// GET /api/chat/:conversationId — Get conversation message history
router.get(
  '/:conversationId',
  authenticate,
  chatController.getHistory
);

// DELETE /api/chat/:conversationId — Delete a conversation
router.delete(
  '/:conversationId',
  authenticate,
  chatController.deleteConversation
);

export default router;
