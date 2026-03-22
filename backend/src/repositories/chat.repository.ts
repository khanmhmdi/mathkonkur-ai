import { prisma } from '../config/database';

export interface ImageData {
  data: string;
  mimeType: string;
}

/**
 * Data access layer for conversations and messages.
 */
export const chatRepository = {
  /**
   * Creates a new conversation for a user.
   */
  async create(data: { userId: string; title: string; subject: string; level: string }) {
    return await prisma.chatConversation.create({
      data: {
        userId: data.userId,
        title: data.title,
        subject: data.subject,
        level: data.level,
      },
    });
  },

  /**
   * Finds a conversation by its ID.
   */
  async findById(id: string) {
    return await prisma.chatConversation.findUnique({
      where: { id },
    });
  },

  /**
   * Lists conversations for a specific user, sorted by most recent update.
   */
  async findByUser(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      prisma.chatConversation.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.chatConversation.count({ where: { userId } }),
    ]);

    return {
      conversations,
      pagination: {
        total,
        page,
        limit,
        hasMore: total > skip + conversations.length,
      },
    };
  },

  /**
   * Adds a message to a conversation.
   * Updates the conversation's updatedAt timestamp automatically via Prisma.
   */
  async addMessage(conversationId: string, role: 'user' | 'assistant' | 'model', content: string, image?: ImageData) {
    // Note: Schema ChatMessage doesn't currently support image storage.
    // We store the text. If images need persistence, they would need a file storage or blob mapping.
    // For now, as per schema, we save the content.
    return await prisma.chatMessage.create({
      data: {
        conversationId,
        role,
        content,
      },
    });
  },

  /**
   * Retrieves message history for a conversation.
   * Default is chronological (oldest first).
   */
  async getMessages(conversationId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.chatMessage.count({ where: { conversationId } }),
    ]);

    return {
      messages,
      pagination: {
        total,
        page,
        limit,
        hasMore: total > skip + messages.length,
      },
    };
  },

  /**
   * Hard deletes a conversation and its cascading messages.
   */
  async delete(id: string) {
    return await prisma.chatConversation.delete({
      where: { id },
    });
  },
};
