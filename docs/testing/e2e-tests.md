# E2E Tests

End-to-end testing for MathKonkur AI using Playwright.

## E2E Test Location

```
mathkonkur-ai/
├── test-e2e-gapgpt.ts
├── test-frontend-gapgpt.ts
└── test-frontend-validation.js
```

## Playwright E2E Tests

**File**: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
```

## Test Files

### Route Navigation Tests (`e2e/routes.spec.ts`)

Tests all frontend routes and navigation:

- `/` - Landing page
- `/bank` - Question bank page
- `/auth` - Authentication page
- `/pricing` - Pricing page
- `/auth-test` - Auth test component

### Authentication Tests (`e2e/auth.spec.ts`)

Tests authentication forms:

- Login form display
- Email/password input fields
- Submit button functionality
- Form validation

### Question Bank Tests (`e2e/question-bank.spec.ts`)

Tests question bank functionality:

- Page loading
- Interactive elements presence

### Chat Interface Tests (`e2e/chat.spec.ts`)

Tests chat modal functionality:

- Opening chat from landing page
- Message input field
- Send button
- Close functionality

## Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run in headed mode
npm run test:e2e:headed

# Or use Playwright directly
npx playwright test
```

## GapGPT API E2E Tests

**File**: `test-e2e-gapgpt.ts`

### Test: AI Service Integration

```typescript
import { aiService } from './backend/src/services/ai.service';

describe('GapGPT API E2E', () => {
  const GAPGPT_API_KEY = process.env.GAPGPT_API_KEY;
  
  beforeAll(() => {
    if (!GAPGPT_API_KEY) {
      throw new Error('GAPGPT_API_KEY not set');
    }
  });

  it('should generate math tutoring response', async () => {
    const messages = [
      { role: 'user', content: 'لطفاً فرمول مشتق را توضیح دهید' }
    ];

    const result = await aiService.generateResponse(
      messages,
      'حسابان',
      'ریاضی فیزیک'
    );

    expect(result.content).toBeTruthy();
    expect(result.tokensUsed).toBeGreaterThan(0);
    expect(result.processingTimeMs).toBeLessThan(30000);
  });

  it('should handle image input', async () => {
    const messages = [
      { role: 'user', content: 'این نمودار را تحلیل کنید' }
    ];

    const result = await aiService.generateResponse(
      messages,
      'هندسه تحلیلی',
      'ریاضی فیزیک',
      {
        data: '<base64-encoded-image>',
        mimeType: 'image/png'
      }
    );

    expect(result.content).toBeTruthy();
  });

  it('should parse LaTeX from response', async () => {
    const messages = [
      { role: 'user', content: 'معادله x = (-b ± √(b²-4ac))/2a را حل کنید' }
    ];

    const result = await aiService.generateResponse(
      messages,
      'جبر و توابع',
      'ریاضی فیزیک'
    );

    const parsed = aiService.parseMathContent(result.content);
    
    expect(parsed.cleanContent).toBeTruthy();
    expect(parsed.extractedFormulas).toBeInstanceOf(Array);
  });
});
```

## Frontend E2E Tests

**File**: `test-frontend-gapgpt.ts`

### Test: Frontend API Integration

```typescript
/**
 * Frontend E2E tests for GapGPT integration
 * Run with: npx tsx test-frontend-gapgpt.ts
 */

import axios from 'axios';

const API_URL = process.env.VITE_API_URL || 'http://localhost:4000/api';
const GAPGPT_API_KEY = process.env.VITE_GAPGPT_API_KEY;

describe('Frontend API Integration', () => {
  let api;

  beforeAll(() => {
    api = axios.create({
      baseURL: API_URL,
      withCredentials: true
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await api.get('/health');
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.status).toBe('ok');
    });
  });

  describe('Question Bank API', () => {
    it('should fetch questions', async () => {
      const response = await api.get('/questions');
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.questions).toBeInstanceOf(Array);
    });

    it('should filter questions by subject', async () => {
      const response = await api.get('/questions', {
        params: { subject: 'جبر و توابع' }
      });
      
      expect(response.status).toBe(200);
      response.data.data.questions.forEach(q => {
        expect(q.subject).toBe('جبر و توابع');
      });
    });
  });
});
```

## Frontend Validation Tests

**File**: `test-frontend-validation.js`

### Test: Form Validation

```javascript
/**
 * Frontend validation tests
 * Run with: node test-frontend-validation.js
 */

const { z } = require('zod');

// Import validation schemas from routes
const registerSchema = z.object({
  email: z.string().email('ایمیل نامعتبر است'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
  name: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد').optional(),
  level: z.enum(['ریاضی فیزیک', 'علوم تجربی', 'انسانی و معارف']).optional()
});

const loginSchema = z.object({
  email: z.string().email('ایمیل نامعتبر است'),
  password: z.string().min(1, 'رمز عبور الزامی است')
});

describe('Validation Schemas', () => {
  describe('Register Schema', () => {
    it('should validate correct registration data', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
        name: 'علی',
        level: 'ریاضی فیزیک'
      };

      const result = registerSchema.safeParse(data);
      
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const data = {
        email: 'not-an-email',
        password: 'password123'
      };

      const result = registerSchema.safeParse(data);
      
      expect(result.success).toBe(false);
      expect(result.error.issues[0].path).toContain('email');
    });

    it('should reject short password', () => {
      const data = {
        email: 'test@example.com',
        password: '123'
      };

      const result = registerSchema.safeParse(data);
      
      expect(result.success).toBe(false);
    });

    it('should reject invalid level', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
        level: 'فیزیک' // Invalid
      };

      const result = registerSchema.safeParse(data);
      
      expect(result.success).toBe(false);
    });
  });

  describe('Login Schema', () => {
    it('should validate correct login data', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = loginSchema.safeParse(data);
      
      expect(result.success).toBe(true);
    });

    it('should reject empty password', () => {
      const data = {
        email: 'test@example.com',
        password: ''
      };

      const result = loginSchema.safeParse(data);
      
      expect(result.success).toBe(false);
    });
  });
});

// Chat validation schemas
const createConversationSchema = z.object({
  initialMessage: z.string().min(1).max(2000),
  subject: z.enum([
    'جبر و توابع', 'معادله و نامعادله', 'توابع و نمودارها',
    'مثلثات', 'هندسه تحلیلی', 'بردارها و هندسه',
    'حسابان', 'گسسته و احتمال'
  ]),
  level: z.enum(['ریاضی فیزیک', 'علوم تجربی', 'انسانی و معارف']),
  image: z.object({
    data: z.string(),
    mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp'])
  }).optional()
});

describe('Chat Validation', () => {
  it('should validate conversation creation', () => {
    const data = {
      initialMessage: 'چگونه مشتق بگیریم؟',
      subject: 'حسابان',
      level: 'ریاضی فیزیک'
    };

    const result = createConversationSchema.safeParse(data);
    
    expect(result.success).toBe(true);
  });

  it('should reject empty message', () => {
    const data = {
      initialMessage: '',
      subject: 'حسابان',
      level: 'ریاضی فیزیک'
    };

    const result = createConversationSchema.safeParse(data);
    
    expect(result.success).toBe(false);
  });

  it('should validate image upload', () => {
    const data = {
      initialMessage: 'این نمودار را بررسی کنید',
      subject: 'هندسه تحلیلی',
      level: 'ریاضی فیزیک',
      image: {
        data: 'base64data',
        mimeType: 'image/png'
      }
    };

    const result = createConversationSchema.safeParse(data);
    
    expect(result.success).toBe(true);
  });
});
```

## Running E2E Tests

```bash
# Run GapGPT API E2E tests
npx tsx test-e2e-gapgpt.ts

# Run frontend API E2E tests
npx tsx test-frontend-gapgpt.ts

# Run validation tests
node test-frontend-validation.js

# Run all E2E tests
npm test
```

## E2E Test Configuration

### Environment Variables

```bash
# Required for E2E tests
export GAPGPT_API_KEY="sk-..."
export VITE_API_URL="http://localhost:4000/api"
export VITE_GAPGPT_API_KEY="sk-..."
```

### Test Setup

```typescript
// Global test setup
beforeAll(async () => {
  // Start server if not running
  // Setup test database
  // Load test data
});

afterAll(async () => {
  // Cleanup test data
  // Close connections
});
```

## E2E Test Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Clean State**: Reset database between tests
3. **Mock External Services**: Use mocks for AI API in unit tests
4. **Real Integration**: Use real API in E2E tests
5. **Timeout**: Set appropriate timeouts (AI responses can be slow)
