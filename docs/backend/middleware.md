# Backend Middleware

Express middleware layer for authentication, validation, and error handling.

## Middleware Location

```
backend/src/middleware/
├── auth.middleware.ts       # JWT authentication
├── validate.middleware.ts   # Zod validation
└── error.middleware.ts      # Error handling
```

## Authentication Middleware (`auth.middleware.ts`)

**File**: `backend/src/middleware/auth.middleware.ts`

### authenticate

Strict authentication middleware requiring valid JWT access token.

**Implementation**:
```typescript
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AuthenticationError('Authorization header required'));
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return next(new AuthenticationError('Token not provided'));
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    next(err);
  }
}
```

**Behavior**:
1. Checks for `Authorization: Bearer <token>` header
2. Extracts token from Bearer prefix
3. Verifies JWT using `verifyAccessToken()` from `utils/jwt.ts`
4. Attaches decoded user to `req.user`
5. Passes to next middleware or error handler

**Extended Request Type**:
```typescript
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        level: string;
        type: 'access';
      };
    }
  }
}
```

### optionalAuth

Optional authentication that proceeds without error if no valid token.

**Implementation**:
```typescript
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  // ... verify token if present ...
  // Gracefully ignore errors and proceed without req.user
}
```

**Behavior**:
- If no auth header: proceed without user
- If invalid token: proceed without user (no error)
- If valid token: attach user to req.user

**Use Cases**:
- `/api/questions` - Public read access
- `/api/questions/:id` - Public read access

## Validation Middleware (`validate.middleware.ts`)

**File**: `backend/src/middleware/validate.middleware.ts`

### validate(schema)

Zod schema validation middleware.

**Implementation**:
```typescript
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'اطلاعات وارد شده معتبر نیست',
          details: result.error.format()
        }
      });
    }

    req.body = result.data;
    next();
  };
};
```

**Behavior**:
1. Accepts Zod schema
2. Validates `req.body` against schema
3. If invalid: returns 400 with error details
4. If valid: replaces req.body with parsed data
5. Continues to next middleware

**Example Usage**:
```typescript
const registerSchema = z.object({
  email: z.string().email('ایمیل نامعتبر است'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
  name: z.string().min(2).optional(),
  level: z.enum(['ریاضی فیزیک', 'علوم تجربی', 'انسانی و معارف']).optional()
});

router.post('/register', validate(registerSchema), register);
```

**Common Zod Schemas**:

| Schema | Fields | Location |
|--------|--------|----------|
| `registerSchema` | email, password, name?, level? | `auth.routes.ts` |
| `loginSchema` | email, password | `auth.routes.ts` |
| `createConversationSchema` | initialMessage, subject, level, image? | `chat.routes.ts` |
| `sendMessageSchema` | content, image? | `chat.routes.ts` |
| `paginationSchema` | page, limit | `chat.routes.ts` |
| `submitAnswerSchema` | answerIndex, timeSpentSeconds? | `question.routes.ts` |
| `addFavoriteSchema` | questionId, notes? | `favorite.routes.ts` |

## Error Middleware (`error.middleware.ts`)

**File**: `backend/src/middleware/error.middleware.ts`

### errorMiddleware

Global error handler for all unhandled errors.

**Implementation**:
```typescript
export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err, 'Request error');

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    });
  }

  // Handle unexpected errors
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'خطای غیرمنتظره‌ای در سرور رخ داد'
    }
  });
};
```

**Error Types Handled**:

| Error Type | Status Code | Code |
|------------|-------------|------|
| `AppError` with `isOperational` | Configurable | AppError.code |
| `AuthenticationError` | 401 | 'AUTH_UNAUTHORIZED' |
| `ValidationError` | 400 | 'VALIDATION_ERROR' |
| `NotFoundError` | 404 | 'NOT_FOUND' |
| `ConflictError` | 409 | 'CONFLICT' |
| Unexpected Error | 500 | 'INTERNAL_ERROR' |

**Response Format**:
```typescript
{
  success: false,
  error: {
    code: string,      // Error code
    message: string,   // Persian error message
    details?: any[]   // Validation details (optional)
  }
}
```

## Error Classes (`utils/errors.ts`)

**File**: `backend/src/utils/errors.ts`

### AppError

Base error class with status code and error code.

```typescript
export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    public isOperational: boolean = true,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

### Subclasses

| Class | Status Code | Code |
|-------|-------------|------|
| `AuthenticationError` | 401 | 'AUTH_UNAUTHORIZED' |
| `ValidationError` | 400 | 'VALIDATION_ERROR' |
| `NotFoundError` | 404 | 'NOT_FOUND' |
| `ConflictError` | 409 | 'CONFLICT' |

**Usage Examples**:
```typescript
// Authentication errors
throw new AuthenticationError('توکن منقضی شده است');

// Validation errors
throw new ValidationError('ایمیل نامعتبر است', details);

// Not found
throw new NotFoundError('کاربر مورد نظر یافت نشد');

// Custom AppError
throw new AppError('AI_TIMEOUT', 504, true);
```

## Middleware Execution Order

In `backend/src/app.ts`:

```typescript
// 1. Security - Helmet
app.use(helmet());

// 2. CORS
app.use(cors({ ... }));

// 3. Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Cookie parsing
app.use(cookieParser());

// 5. Request logging
app.use((req, res, next) => { ... });

// 6. Health check (no auth)
app.get('/health', ...);

// 7. API routes with auth/validation middleware
app.use('/api/auth', authRoutes);        // validation middleware
app.use('/api/chat', chatRoutes);        // authenticate + validation
app.use('/api/questions', questionRoutes); // optionalAuth + validation
app.use('/api/favorites', favoriteRoutes); // authenticate + validation
app.use('/api/user', userRoutes);        // authenticate

// 8. 404 handler
app.use('*', ...);

// 9. Error handler (last)
app.use(errorMiddleware);
```
