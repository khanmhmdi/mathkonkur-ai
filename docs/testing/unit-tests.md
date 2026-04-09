# Unit Tests

Unit testing patterns and examples for MathKonkur AI.

## Unit Test Location

```
backend/src/services/
├── auth.service.test.ts
├── question.service.test.ts
└── progress.service.test.ts
```

## Auth Service Tests

**File**: `backend/src/services/auth.service.test.ts`

### Test: Password Hashing

```typescript
import { authService } from './auth.service';
import bcrypt from 'bcrypt';

describe('AuthService - Password Hashing', () => {
  it('should hash password with bcrypt', async () => {
    const password = 'testPassword123';
    
    const hash = await authService.hashPassword(password);
    
    expect(hash).not.toBe(password);
    expect(hash.startsWith('$2b$10$')).toBe(true);
  });

  it('should verify correct password', async () => {
    const password = 'testPassword123';
    const hash = await authService.hashPassword(password);
    
    const isValid = await authService.verifyPassword(password, hash);
    
    expect(isValid).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const password = 'testPassword123';
    const hash = await authService.hashPassword(password);
    
    const isValid = await authService.verifyPassword('wrongPassword', hash);
    
    expect(isValid).toBe(false);
  });
});
```

### Test: JWT Token Generation

```typescript
describe('AuthService - JWT Tokens', () => {
  it('should generate access token', async () => {
    const user = createTestUser();
    
    const token = await authService.generateAccessToken(user);
    
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
  });

  it('should generate refresh token', async () => {
    const user = createTestUser();
    
    const token = await authService.generateRefreshToken(user, 'session-uuid');
    
    expect(token).toBeDefined();
  });

  it('should verify access token', async () => {
    const user = createTestUser();
    const token = await authService.generateAccessToken(user);
    
    const decoded = await authService.verifyAccessToken(token);
    
    expect(decoded.userId).toBe(user.id);
    expect(decoded.email).toBe(user.email);
  });
});
```

### Test: User Registration

```typescript
describe('AuthService - Registration', () => {
  it('should create user with hashed password', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    
    const result = await authService.register(email, password);
    
    expect(result.user.email).toBe(email);
    expect(result.user.passwordHash).not.toBe(password);
    expect(result.accessToken).toBeDefined();
  });

  it('should reject duplicate email', async () => {
    // Setup: create user first
    await authService.register('test@example.com', 'password123');
    
    // Act & Assert
    await expect(
      authService.register('test@example.com', 'differentpassword')
    ).rejects.toThrow();
  });
});
```

## Question Service Tests

**File**: `backend/src/services/question.service.test.ts`

### Test: Get Questions

```typescript
import { questionService } from './question.service';
import { prisma } from '../config/database';

describe('QuestionService - Get Questions', () => {
  beforeEach(async () => {
    // Seed test data
    await prisma.question.createMany({
      data: [
        { questionNumber: 1, text: 'سوال ۱', subject: 'جبر و توابع', level: 'متوسط', correctAnswer: 0, explanation: 'توضیح' },
        { questionNumber: 2, text: 'سوال ۲', subject: 'معادله و نامعادله', level: 'سخت', correctAnswer: 1, explanation: 'توضیح' },
      ]
    });
  });

  afterEach(async () => {
    await prisma.question.deleteMany({});
  });

  it('should return all questions', async () => {
    const result = await questionService.getQuestions({}, { page: 1, limit: 10 });
    
    expect(result.questions).toHaveLength(2);
    expect(result.meta.total).toBe(2);
  });

  it('should filter by subject', async () => {
    const result = await questionService.getQuestions(
      { subject: 'جبر و توابع' },
      { page: 1, limit: 10 }
    );
    
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].subject).toBe('جبر و توابع');
  });

  it('should filter by level', async () => {
    const result = await questionService.getQuestions(
      { level: 'سخت' },
      { page: 1, limit: 10 }
    );
    
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].level).toBe('سخت');
  });

  it('should paginate results', async () => {
    // Create 15 questions
    for (let i = 3; i <= 17; i++) {
      await prisma.question.create({
        data: { questionNumber: i, text: `سوال ${i}`, subject: 'عمومی', level: 'آسان', correctAnswer: 0, explanation: 'توضیح' }
      });
    }

    const result = await questionService.getQuestions({}, { page: 1, limit: 10 });
    
    expect(result.questions).toHaveLength(10);
    expect(result.meta.page).toBe(1);
    expect(result.meta.totalPages).toBe(2);
  });
});
```

### Test: Submit Answer

```typescript
describe('QuestionService - Submit Answer', () => {
  it('should mark correct answer', async () => {
    const question = await prisma.question.create({
      data: { questionNumber: 1, text: 'سوال', subject: 'عمومی', level: 'آسان', correctAnswer: 0, explanation: 'توضیح' }
    });
    const user = await createTestUser();

    const result = await questionService.submitAnswer(question.id, user.id, 0);
    
    expect(result.correct).toBe(true);
    expect(result.correctAnswer).toBe(0);
  });

  it('should mark incorrect answer', async () => {
    const question = await prisma.question.create({
      data: { questionNumber: 1, text: 'سوال', subject: 'عمومی', level: 'آسان', correctAnswer: 2, explanation: 'توضیح' }
    });
    const user = await createTestUser();

    const result = await questionService.submitAnswer(question.id, user.id, 0);
    
    expect(result.correct).toBe(false);
    expect(result.correctAnswer).toBe(2);
  });
});
```

## Progress Service Tests

**File**: `backend/src/services/progress.service.test.ts`

### Test: SM-2 Algorithm

```typescript
import { progressService } from './progress.service';

describe('ProgressService - SM-2 Algorithm', () => {
  it('should calculate next review for first correct answer', () => {
    const result = progressService.calculateNextReview(true, {
      masteryLevel: 0,
      srsInterval: 1,
      srsEaseFactor: 2.5,
      srsRepetitions: 0
    });
    
    expect(result.srsRepetitions).toBe(1);
    expect(result.srsInterval).toBe(1); // 1 day
    expect(result.masteryLevel).toBeGreaterThan(0);
  });

  it('should increase interval for subsequent correct answers', () => {
    const result = progressService.calculateNextReview(true, {
      masteryLevel: 0.5,
      srsInterval: 3,
      srsEaseFactor: 2.5,
      srsRepetitions: 2
    });
    
    expect(result.srsRepetitions).toBe(3);
    expect(result.srsInterval).toBeGreaterThan(3); // Multiplied by ease factor
  });

  it('should reset repetitions for incorrect answer', () => {
    const result = progressService.calculateNextReview(false, {
      masteryLevel: 0.8,
      srsInterval: 10,
      srsEaseFactor: 2.5,
      srsRepetitions: 5
    });
    
    expect(result.srsRepetitions).toBe(0);
    expect(result.srsInterval).toBe(1); // Reset to 1 day
    expect(result.masteryLevel).toBeLessThan(0.8);
  });

  it('should reduce ease factor for incorrect answer', () => {
    const result = progressService.calculateNextReview(false, {
      masteryLevel: 0.5,
      srsInterval: 5,
      srsEaseFactor: 2.5,
      srsRepetitions: 3
    });
    
    expect(result.srsEaseFactor).toBeLessThan(2.5);
    expect(result.srsEaseFactor).toBeGreaterThanOrEqual(1.3); // Minimum
  });
});
```

## Running Unit Tests

```bash
cd backend
npm test

# With coverage
npm test -- --coverage

# Specific test file
npm test -- auth.service.test.ts
```
