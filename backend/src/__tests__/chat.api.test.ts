import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../config/database';
import { register } from '../services/auth.service';

describe('Chat API Endpoints', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const testUser = await register({
      email: `chat-test-${Date.now()}@test.com`,
      password: 'testpassword123',
      name: 'Chat Test User',
    });
    userId = testUser.user.id;

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.user.email, password: 'testpassword123' });

    authToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    try {
      await prisma.chatConversation.deleteMany({ where: { userId } });
      await prisma.session.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } });
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  describe('POST /api/chat', () => {
    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ initialMessage: 'Test' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should validate subject enum', async () => {
      const res = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          initialMessage: 'Test question',
          subject: 'Invalid Subject',
          level: ' Math-Physics',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/chat', () => {
    it('should list user conversations', async () => {
      const res = await request(app)
        .get('/api/chat')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.conversations).toBeInstanceOf(Array);
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/chat');

      expect(res.status).toBe(401);
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/chat?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.limit).toBe(10);
    });
  });
});
