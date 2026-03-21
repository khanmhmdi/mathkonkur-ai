# Integration Tests

API integration testing patterns for MathKonkur AI backend.

## Integration Test Location

```
backend/src/
├── app.test.ts              # Main app integration tests
├── controllers/
│   ├── chat.controller.test.ts
│   ├── favorite.controller.test.ts
│   └── question.controller.test.ts
└── services/
    └── ai.service.verify.ts
```

## App Integration Tests

**File**: `backend/src/app.test.ts`

### Test: Health Check

```typescript
import request from 'supertest';
import { app } from './app';

describe('GET /health', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
    expect(response.body.data.version).toBe('1.0.0');
  });
});

describe('GET /api/test', () => {
  it('should return test message', async () => {
    const response = await request(app).get('/api/test');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('API is working');
  });
});
```

## Chat Controller Integration Tests

**File**: `backend/src/controllers/chat.controller.test.ts`

### Test: Create Conversation

```typescript
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../config/database';
import { generateTestToken } from '../utils/test-helpers';

describe('POST /api/chat', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    testUser = await prisma.user.create({
      data: {
        email: 'chat-test@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        name: 'Chat Test User',
        level: 'ریاضی فیزیک'
      }
    });
    authToken = generateTestToken(testUser);
  });

  afterAll(async () => {
    await prisma.chatConversation.deleteMany({ where: { userId: testUser.id } });
    await prisma.session.deleteMany({ where: { userId: testUser.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
  });

  it('should create new conversation', async () => {
    const response = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        initialMessage: 'چگونه مشتق بگیریم؟',
        subject: 'حسابان',
        level: 'ریاضی فیزیک'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.conversation).toBeDefined();
    expect(response.body.data.messages).toHaveLength(2); // User + AI
  });

  it('should reject unauthenticated request', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({
        initialMessage: 'Test',
        subject: 'حسابان',
        level: 'ریاضی فیزیک'
      });

    expect(response.status).toBe(401);
  });

  it('should validate required fields', async () => {
    const response = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        initialMessage: 'Test'
        // missing subject and level
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
```

### Test: Send Message

```typescript
describe('POST /api/chat/:conversationId/message', () => {
  let conversation;
  let authToken;

  beforeAll(async () => {
    conversation = await prisma.chatConversation.create({
      data: {
        userId: testUser.id,
        subject: 'حسابان',
        level: 'ریاضی فیزیک'
      }
    });
  });

  it('should send message and get AI response', async () => {
    const response = await request(app)
      .post(`/api/chat/${conversation.id}/message`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        content: 'سوال دیگری دارم'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.message.role).toBe('user');
    expect(response.body.data.response.role).toBe('assistant');
  });

  it('should return 404 for non-existent conversation', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    
    const response = await request(app)
      .post(`/api/chat/${fakeId}/message`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: 'Test' });

    expect(response.status).toBe(404);
  });
});
```

## Favorite Controller Integration Tests

**File**: `backend/src/controllers/favorite.controller.test.ts`

### Test: Favorites CRUD

```typescript
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../config/database';

describe('Favorites API', () => {
  let testUser;
  let testQuestion;
  let authToken;

  beforeAll(async () => {
    testUser = await createTestUser();
    testQuestion = await prisma.question.create({
      data: {
        questionNumber: 999,
        text: 'تست سوال',
        subject: 'عمومی',
        level: 'آسان',
        correctAnswer: 0,
        explanation: 'توضیح تست'
      }
    });
    authToken = generateTestToken(testUser);
  });

  afterAll(async () => {
    await prisma.userFavorite.deleteMany({ where: { userId: testUser.id } });
    await prisma.question.delete({ where: { id: testQuestion.id } });
    await cleanupUser(testUser.id);
  });

  describe('POST /api/favorites', () => {
    it('should add question to favorites', async () => {
      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          questionId: testQuestion.id,
          notes: 'سوال مهم'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.questionId).toBe(testQuestion.id);
      expect(response.body.data.notes).toBe('سوال مهم');
    });

    it('should reject duplicate favorite', async () => {
      // Already added in previous test
      
      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ questionId: testQuestion.id });

      expect(response.status).toBe(409);
    });
  });

  describe('GET /api/favorites', () => {
    it('should list user favorites', async () => {
      const response = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.favorites).toHaveLength(1);
    });
  });

  describe('DELETE /api/favorites/:questionId', () => {
    it('should remove favorite', async () => {
      const response = await request(app)
        .delete(`/api/favorites/${testQuestion.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      // Verify deleted
      const check = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(check.body.data.favorites).toHaveLength(0);
    });
  });
});
```

## Question Controller Integration Tests

**File**: `backend/src/controllers/question.controller.test.ts`

### Test: Question CRUD

```typescript
describe('Questions API', () => {
  let testUser;
  let testQuestions = [];

  beforeAll(async () => {
    testUser = await createTestUser();
    
    // Create test questions
    for (let i = 0; i < 5; i++) {
      const q = await prisma.question.create({
        data: {
          questionNumber: 100 + i,
          text: `سوال تست ${i}`,
          subject: i % 2 === 0 ? 'جبر و توابع' : 'معادله و نامعادله',
          level: i % 2 === 0 ? 'آسان' : 'سخت',
          correctAnswer: 0,
          explanation: 'توضیح'
        }
      });
      testQuestions.push(q);
    }
  });

  afterAll(async () => {
    await prisma.question.deleteMany({ where: { id: { in: testQuestions.map(q => q.id) } } });
    await cleanupUser(testUser.id);
  });

  describe('GET /api/questions', () => {
    it('should list all questions', async () => {
      const response = await request(app)
        .get('/api/questions');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.questions.length).toBeGreaterThanOrEqual(5);
    });

    it('should filter by subject', async () => {
      const response = await request(app)
        .get('/api/questions')
        .query({ subject: 'جبر و توابع' });

      expect(response.status).toBe(200);
      response.body.data.questions.forEach(q => {
        expect(q.subject).toBe('جبر و توابع');
      });
    });

    it('should filter by level', async () => {
      const response = await request(app)
        .get('/api/questions')
        .query({ level: 'سخت' });

      expect(response.status).toBe(200);
      response.body.data.questions.forEach(q => {
        expect(q.level).toBe('سخت');
      });
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/questions')
        .query({ page: 1, limit: 2 });

      expect(response.status).toBe(200);
      expect(response.body.data.questions).toHaveLength(2);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(2);
    });
  });

  describe('POST /api/questions/:id/submit', () => {
    it('should submit answer and return result', async () => {
      const question = testQuestions[0];
      
      const response = await request(app)
        .post(`/api/questions/${question.id}/submit`)
        .set('Authorization', `Bearer ${generateTestToken(testUser)}`)
        .send({ answerIndex: 0 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.correct).toBe(true);
      expect(response.body.data.explanation).toBeDefined();
    });
  });
});
```

## AI Service Verification

**File**: `backend/src/services/ai.service.verify.ts`

### Test: AI Response Generation

```typescript
import { aiService } from './ai.service';

describe('AI Service', () => {
  describe('generateResponse', () => {
    it('should generate response with Persian text', async () => {
      const messages = [
        { role: 'user', content: 'چگونه مشتق بگیریم؟' }
      ];

      const result = await aiService.generateResponse(
        messages,
        'حسابان',
        'ریاضی فیزیک'
      );

      expect(result.content).toBeDefined();
      expect(result.tokensUsed).toBeGreaterThan(0);
      expect(result.modelVersion).toBe('gapgpt-qwen-3.5');
    });

    it('should include LaTeX formulas', async () => {
      const messages = [
        { role: 'user', content: 'فرمول مشتق را بنویس' }
      ];

      const result = await aiService.generateResponse(
        messages,
        'حسابان',
        'ریاضی فیزیک'
      );

      const parsed = aiService.parseMathContent(result.content);
      expect(parsed.extractedFormulas.length).toBeGreaterThan(0);
    });
  });
});
```

## Running Integration Tests

```bash
cd backend
npm test

# Run specific controller tests
npm test -- chat.controller.test.ts

# Run with verbose output
npm test -- --verbose
```
