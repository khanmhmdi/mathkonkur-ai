import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { chatRepository } from '../repositories/chat.repository';
import { prisma } from '../config/database';
import { register } from '../services/auth.service';

describe('Chat Repository Database Tests', () => {
  let userId: string;

  beforeAll(async () => {
    const testUser = await register({
      email: `chat-repo-${Date.now()}@test.com`,
      password: 'testpassword123',
      name: 'Chat Repo Test',
    });
    userId = testUser.user.id;
  });

  afterAll(async () => {
    await prisma.chatConversation.deleteMany({ where: { userId } });
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  });

  describe('create', () => {
    it('should create a new conversation', async () => {
      const conv = await chatRepository.create({
        userId,
        title: 'Test Conversation',
        subject: 'Calculus',
        level: 'Math-Physics',
      });

      expect(conv.id).toBeDefined();
      expect(conv.userId).toBe(userId);
      expect(conv.title).toBe('Test Conversation');
      expect(conv.subject).toBe('Calculus');
      expect(conv.level).toBe('Math-Physics');
      expect(conv.createdAt).toBeInstanceOf(Date);
      expect(conv.updatedAt).toBeInstanceOf(Date);

      await chatRepository.delete(conv.id);
    });
  });

  describe('findById', () => {
    it('should find conversation by id', async () => {
      const created = await chatRepository.create({
        userId,
        title: 'Find Test',
        subject: 'Algebra',
        level: 'Natural Sciences',
      });

      const found = await chatRepository.findById(created.id);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.title).toBe('Find Test');

      await chatRepository.delete(created.id);
    });

    it('should return null for non-existent id', async () => {
      const found = await chatRepository.findById('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('findByUser', () => {
    it('should return paginated conversations for user', async () => {
      const conv1 = await chatRepository.create({
        userId,
        title: 'Conv 1',
        subject: 'Calculus',
        level: 'Math-Physics',
      });
      const conv2 = await chatRepository.create({
        userId,
        title: 'Conv 2',
        subject: 'Geometry',
        level: 'Math-Physics',
      });

      const result = await chatRepository.findByUser(userId, 1, 10);

      expect(result.conversations.length).toBeGreaterThanOrEqual(2);
      expect(result.pagination.total).toBeGreaterThanOrEqual(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);

      await chatRepository.delete(conv1.id);
      await chatRepository.delete(conv2.id);
    });

    it('should respect pagination', async () => {
      const conv1 = await chatRepository.create({
        userId,
        title: 'Page Test 1',
        subject: 'Calculus',
        level: 'Math-Physics',
      });
      const conv2 = await chatRepository.create({
        userId,
        title: 'Page Test 2',
        subject: 'Calculus',
        level: 'Math-Physics',
      });

      const result = await chatRepository.findByUser(userId, 1, 1);

      expect(result.conversations.length).toBeLessThanOrEqual(1);
      expect(result.pagination.hasMore).toBe(true);

      await chatRepository.delete(conv1.id);
      await chatRepository.delete(conv2.id);
    });
  });

  describe('addMessage', () => {
    it('should add message to conversation', async () => {
      const conv = await chatRepository.create({
        userId,
        title: 'Message Test',
        subject: 'Calculus',
        level: 'Math-Physics',
      });

      const msg = await chatRepository.addMessage(conv.id, 'user', 'Hello AI');

      expect(msg.id).toBeDefined();
      expect(msg.conversationId).toBe(conv.id);
      expect(msg.role).toBe('user');
      expect(msg.content).toBe('Hello AI');
      expect(msg.createdAt).toBeInstanceOf(Date);

      await chatRepository.delete(conv.id);
    });

    it('should support assistant role', async () => {
      const conv = await chatRepository.create({
        userId,
        title: 'Assistant Test',
        subject: 'Calculus',
        level: 'Math-Physics',
      });

      const msg = await chatRepository.addMessage(conv.id, 'assistant', 'Hello!');

      expect(msg.role).toBe('assistant');
      expect(msg.content).toBe('Hello!');

      await chatRepository.delete(conv.id);
    });
  });

  describe('getMessages', () => {
    it('should return paginated messages', async () => {
      const conv = await chatRepository.create({
        userId,
        title: 'Get Messages Test',
        subject: 'Calculus',
        level: 'Math-Physics',
      });

      await chatRepository.addMessage(conv.id, 'user', 'Message 1');
      await chatRepository.addMessage(conv.id, 'assistant', 'Response 1');
      await chatRepository.addMessage(conv.id, 'user', 'Message 2');

      const result = await chatRepository.getMessages(conv.id, 1, 10);

      expect(result.messages.length).toBe(3);
      expect(result.pagination.total).toBe(3);
      expect(result.messages[0].content).toBe('Message 1');
      expect(result.messages[1].content).toBe('Response 1');
      expect(result.messages[2].content).toBe('Message 2');

      await chatRepository.delete(conv.id);
    });

    it('should sort messages chronologically', async () => {
      const conv = await chatRepository.create({
        userId,
        title: 'Chrono Test',
        subject: 'Calculus',
        level: 'Math-Physics',
      });

      await chatRepository.addMessage(conv.id, 'user', 'First');
      await chatRepository.addMessage(conv.id, 'user', 'Second');
      await chatRepository.addMessage(conv.id, 'user', 'Third');

      const result = await chatRepository.getMessages(conv.id, 1, 10);

      expect(result.messages[0].content).toBe('First');
      expect(result.messages[1].content).toBe('Second');
      expect(result.messages[2].content).toBe('Third');

      await chatRepository.delete(conv.id);
    });
  });

  describe('delete', () => {
    it('should delete conversation and cascade messages', async () => {
      const conv = await chatRepository.create({
        userId,
        title: 'Delete Test',
        subject: 'Calculus',
        level: 'Math-Physics',
      });

      await chatRepository.addMessage(conv.id, 'user', 'Test message');

      await chatRepository.delete(conv.id);

      const found = await chatRepository.findById(conv.id);
      expect(found).toBeNull();

      const messages = await chatRepository.getMessages(conv.id, 1, 10);
      expect(messages.messages.length).toBe(0);
    });
  });
});
