import { Request, Response, NextFunction } from 'express';
import { chatService } from '../services/chat.service';
import { success } from '../utils/api-response';
import { ImageData } from '../services/ai.service';

// Ensure the global Request type extension from auth.middleware is recognized
import '../middleware/auth.middleware';

/**
 * HTTP handlers for chat endpoints.
 */
export const chatController = {

  /**
   * POST /api/chat
   * Creates a new conversation with an initial message.
   */
  async createConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { initialMessage, subject, level } = req.body;
      const userId = (req.user as any).userId;

      let image: ImageData | undefined;
      if (req.body.image) {
        const { data, mimeType } = req.body.image;
        const rawSizeBytes = Buffer.byteLength(data, 'base64');
        if (rawSizeBytes > 5 * 1024 * 1024) {
          res.status(413).json({ success: false, error: { code: 'IMAGE_TOO_LARGE', message: 'Image must be under 5MB' } });
          return;
        }
        image = { data, mimeType };
      }

      const result = await chatService.createConversation({
        userId,
        initialMessage,
        subject,
        level,
        image,
      });

      res.status(201).json(success(result));
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/chat/:conversationId/message
   * Sends a new message to an existing conversation.
   */
  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversationId = String(req.params.conversationId);
      const { content } = req.body;
      const userId = (req.user as any).userId;

      let image: ImageData | undefined;
      if (req.body.image) {
        const { data, mimeType } = req.body.image;
        const rawSizeBytes = Buffer.byteLength(data, 'base64');
        if (rawSizeBytes > 5 * 1024 * 1024) {
          res.status(413).json({ success: false, error: { code: 'IMAGE_TOO_LARGE', message: 'Image must be under 5MB' } });
          return;
        }
        image = { data, mimeType };
      }

      const response = await chatService.processMessage({
        conversationId,
        userId,
        content,
        image,
      });

      res.status(200).json(success({ message: response }));
    } catch (err: any) {
      // Surface AI timeout with a clear user-facing Persian message
      if (err.message === 'AI_TIMEOUT') {
        res.status(504).json({ success: false, error: { code: 'AI_TIMEOUT', message: 'هوش مصنوعی در حال پردازش است، لطفاً دوباره تلاش کنید.' } });
        return;
      }
      next(err);
    }
  },

  /**
   * GET /api/chat/:conversationId
   * returns the paginated message history for a conversation.
   */
  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversationId = String(req.params.conversationId);
      const userId = (req.user as any).userId;
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));

      const result = await chatService.getConversationHistory(conversationId, userId, page, limit);
      res.json(success(result));
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/chat
   * Returns the paginated list of conversations for the authenticated user.
   */
  async getConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as any).userId;
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

      const result = await chatService.getUserConversations(userId, page, limit);
      res.json(success(result));
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/chat/:conversationId
   * Hard deletes a conversation and all its messages.
   */
  async deleteConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversationId = String(req.params.conversationId);
      const userId = (req.user as any).userId;

      await chatService.deleteConversation(conversationId, userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
