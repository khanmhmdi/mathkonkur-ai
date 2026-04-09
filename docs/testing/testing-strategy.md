# Testing Strategy

Testing approach and structure for MathKonkur AI.

## Testing Overview

The project uses Jest for testing with two separate configurations:
- **Root**: Frontend testing with React Testing Library
- **Backend**: Backend testing with supertest

## Test Configuration

### Frontend (`jest.config.js`)

**Location**: `jest.config.js`

```javascript
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/*.test.{ts,tsx}'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  }
};
```

### Frontend Setup (`jest.setup.js`)

**Location**: `jest.setup.js`

```javascript
import '@testing-library/jest-dom';
```

### Frontend Test Setup (`jest.setup.test.tsx`)

**Location**: `src/jest.setup.test.tsx`

```typescript
import { render } from '@testing-library/react';
import { AuthProvider } from './contexts/AuthContext';

// Custom render with providers
function renderWithProviders(ui: React.ReactNode) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}
```

### Backend (`backend/jest.config.js`)

**Location**: `backend/jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts'
  ]
};
```

## Test Files Structure

```
mathkonkur-ai/
├── e2e/
│   ├── playwright.config.ts
│   ├── routes.spec.ts
│   ├── auth.spec.ts
│   ├── question-bank.spec.ts
│   └── chat.spec.ts
├── jest.config.js              # Frontend config
├── src/
│   ├── jest.setup.js
│   ├── jest.setup.test.tsx
│   ├── App.test.tsx
│   └── components/
│       └── *.test.tsx
│
backend/
├── jest.config.js              # Backend config
└── src/
    ├── app.test.ts             # Integration tests
    ├── controllers/
    │   ├── chat.controller.test.ts
    │   ├── favorite.controller.test.ts
    │   └── question.controller.test.ts
    ├── services/
    │   ├── auth.service.test.ts
    │   ├── question.service.test.ts
    │   └── progress.service.test.ts
    └── services/
        └── ai.service.verify.ts
```

## Running Tests

### Frontend Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- App.test.tsx
```

### Backend Tests

```bash
cd backend
npm test

# Run with coverage
npm test -- --coverage
```

## Test Categories

### Unit Tests

**Purpose**: Test individual functions/classes in isolation

**Examples**:
- `auth.service.test.ts` - Test password hashing, token generation
- `progress.service.test.ts` - Test SM-2 algorithm
- `ai.service.verify.ts` - Verify AI service behavior

### Integration Tests

**Purpose**: Test API endpoints with real database

**Examples**:
- `app.test.ts` - Test full request/response cycle
- `chat.controller.test.ts` - Test chat endpoints
- `question.controller.test.ts` - Test question endpoints

### E2E Tests

**Location**: Root level test files

**Files**:
- `test-e2e-gapgpt.ts` - GapGPT API E2E tests
- `test-frontend-gapgpt.ts` - Frontend E2E tests
- `test-frontend-validation.js` - Frontend validation tests

### Playwright E2E Tests (New)

**Location**: `e2e/` directory

**Files**:
- `playwright.config.ts` - Playwright configuration
- `e2e/routes.spec.ts` - Route navigation tests (9 tests)
- `e2e/auth.spec.ts` - Authentication form tests (5 tests)
- `e2e/question-bank.spec.ts` - Question bank tests (2 tests)
- `e2e/chat.spec.ts` - Chat interface tests (6 tests)

**Total**: 22 E2E tests covering all frontend routes and functionality

**Run commands**:
```bash
npm run test:e2e        # Run all E2E tests
npm run test:e2e:ui     # Run with UI mode
npm run test:e2e:headed # Run in headed mode
```

## Test Patterns

### Backend Controller Test Pattern

```typescript
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../config/database';

describe('Chat Controller', () => {
  beforeAll(async () => {
    // Setup test database
  });

  afterAll(async () => {
    // Cleanup
    await prisma.$disconnect();
  });

  describe('POST /api/chat', () => {
    it('should create a new conversation', async () => {
      // Arrange
      const user = await createTestUser();
      const token = generateTestToken(user);

      // Act
      const response = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          initialMessage: 'Test message',
          subject: 'جبر و توابع',
          level: 'ریاضی فیزیک'
        });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.conversation).toBeDefined();
    });
  });
});
```

### Service Test Pattern

```typescript
import { authService } from '../services/auth.service';
import { prisma } from '../config/database';

describe('Auth Service', () => {
  describe('register', () => {
    it('should create user with hashed password', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';

      // Act
      const result = await authService.register(email, password);

      // Assert
      expect(result.user.email).toBe(email);
      expect(result.accessToken).toBeDefined();

      // Verify password was hashed
      const user = await prisma.user.findUnique({ where: { email } });
      const isValid = await bcrypt.compare(password, user.passwordHash);
      expect(isValid).toBe(true);
    });
  });
});
```

### Frontend Component Test Pattern

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthPage } from '../components/AuthPage';

describe('AuthPage', () => {
  it('should show login form by default', () => {
    render(<AuthPage />);
    
    expect(screen.getByText('ورود')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ایمیل')).toBeInTheDocument();
  });

  it('should switch to register form', () => {
    render(<AuthPage />);
    
    fireEvent.click(screen.getByText('ثبت‌نام'));
    
    expect(screen.getByText('ثبت‌نام')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('نام')).toBeInTheDocument();
  });
});
```

## Test Utilities

### Test User Creation

```typescript
async function createTestUser() {
  return prisma.user.create({
    data: {
      email: 'test@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      name: 'Test User',
      level: 'ریاضی فیزیک'
    }
  });
}
```

### Test Token Generation

```typescript
function generateTestToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}
```

### Database Cleanup

```typescript
afterEach(async () => {
  await prisma.user.deleteMany({ where: {} });
  await prisma.session.deleteMany({ where: {} });
  await prisma.chatConversation.deleteMany({ where: {} });
  await prisma.question.deleteMany({ where: {} });
});
```

## Coverage Requirements

| Type | Minimum Coverage |
|------|------------------|
| Statements | 70% |
| Branches | 70% |
| Functions | 70% |
| Lines | 70% |

## Mock Patterns

### Mock External Services

```typescript
// Mock AI service
jest.mock('../services/ai.service', () => ({
  aiService: {
    generateResponse: jest.fn().mockResolvedValue({
      content: 'Test response',
      tokensUsed: 100,
      modelVersion: 'gapgpt-qwen-3.5'
    })
  }
}));
```

### Mock Database

```typescript
// Use in-memory SQLite for testing
beforeAll(() => {
  process.env.DATABASE_URL = 'file:./test.db';
});
```

## CI Integration

Tests should run on every push:

```yaml
# GitHub Actions example
name: Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Node
        uses: actions/setup-node@v2
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm install && cd backend && npm install
      - name: Run frontend tests
        run: npm test
      - name: Run backend tests
        run: cd backend && npm test
```
