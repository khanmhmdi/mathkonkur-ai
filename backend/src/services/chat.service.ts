import { aiService, ImageData } from './ai.service';
import { chatRepository } from '../repositories/chat.repository';
import { AppError } from '../utils/errors';
import logger from '../config/logger';

interface CreateConversationInput {
  userId: string;
  initialMessage: string;
  subject: string;
  level: string;
  image?: ImageData;
}

interface SendMessageInput {
  conversationId: string;
  userId: string;
  content: string;
  image?: ImageData;
}

/**
 * Business logic layer for chat functionality.
 * Manages conversation persistence, context windows, and AI orchestration.
 */
class ChatService {
  /**
   * Initializes a new conversation thread and processes the first message.
   */
  async createConversation(input: CreateConversationInput) {
    const { userId, initialMessage, subject, level, image } = input;

    // 1. Generate Title (First 30 chars, no LaTeX/newlines)
    const cleanTitle = initialMessage
      .replace(/[\$\n]/g, ' ') // Strip LaTeX delimiters and newlines
      .trim()
      .substring(0, 30);
    const title = cleanTitle.length >= 30 ? `${cleanTitle}...` : cleanTitle;

    // 2. Create Conversation Record
    const conv = await chatRepository.create({ userId, title, subject, level });

    // 3. Save User Message
    await chatRepository.addMessage(conv.id, 'user', initialMessage, image);

    // 4. Get AI Response via processMessage logic (last 10 context)
    const history = [{ role: 'user' as const, content: initialMessage }];
    const aiResponse = await aiService.generateResponse(history, subject, level, image);

    // 5. Save AI Response
    const aiMessage = await chatRepository.addMessage(conv.id, 'model', aiResponse.content);

    return {
      conversation: conv,
      message: aiMessage
    };
  }

  /**
   * Adds a user message to an existing conversation and returns the AI response.
   */
  async processMessage(input: SendMessageInput) {
    const { conversationId, userId, content, image } = input;

    // 1. Ownership & Existence Check
    const conv = await this.verifyOwnership(conversationId, userId);

    // 2. Save User Message
    await chatRepository.addMessage(conversationId, 'user', content, image);

    // 3. Fetch Context (Last 10 messages for token efficiency)
    const { messages: history } = await chatRepository.getMessages(conversationId, 1, 10);
    
    // 4. Generate AI Response
    const aiResponse = await aiService.generateResponse(
      history.map((m: any) => ({ role: m.role as 'user'|'model', content: m.content })),
      conv.subject,
      conv.level,
      image
    );

    // 5. Save and Return AI Message
    const aiMessage = await chatRepository.addMessage(conversationId, 'model', aiResponse.content);
    
    return aiMessage;
  }

  /**
   * Retrieves paginated chronological message history.
   */
  async getConversationHistory(conversationId: string, userId: string, page: number = 1, limit: number = 50) {
    await this.verifyOwnership(conversationId, userId);
    return await chatRepository.getMessages(conversationId, page, limit);
  }

  /**
   * Lists conversations for the current user (most recent first).
   */
  async getUserConversations(userId: string, page: number = 1, limit: number = 20) {
    return await chatRepository.findByUser(userId, page, limit);
  }

  /**
   * Hard deletes a conversation.
   */
  async deleteConversation(conversationId: string, userId: string) {
    await this.verifyOwnership(conversationId, userId);
    await chatRepository.delete(conversationId);
  }

  /**
   * Private helper to ensure the user owns the conversation they are interacting with.
   */
  private async verifyOwnership(conversationId: string, userId: string) {
    const conv = await chatRepository.findById(conversationId);

    if (!conv) {
      throw new AppError('CONVERSATION_NOT_FOUND', 404, true);
    }

    if (conv.userId !== userId) {
      logger.warn({ conversationId, userId }, 'Unauthorized conversation access attempt');
      throw new AppError('UNAUTHORIZED', 403, true);
    }

    return conv;
  }
}

export const chatService = new ChatService();
