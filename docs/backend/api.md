# Backend API Reference

Complete API documentation for all endpoints.

## Base URL

```
http://localhost:4000/api
```

## Authentication Endpoints (`/api/auth`)

### POST /auth/register

Register a new user account.

**Request Body**:
```typescript
{
  email: string,      // required, valid email format
  password: string,   // required, min 6 characters
  name?: string,      // optional, min 2 characters
  level?: string      // optional, one of: 'ریاضی فیزیک', 'علوم تجربی', 'انسانی و معارف'
}
```

**Response (201 Created)**:
```typescript
{
  success: true,
  data: {
    user: { id, email, name, level, createdAt },
    accessToken: string
  },
  timestamp: string
}
```

**Validation Errors (400)**:
```typescript
{
  success: false,
  error: { code: 'VALIDATION_ERROR', message: string, details: [...] }
}
```

### POST /auth/login

Authenticate user and receive tokens.

**Request Body**:
```typescript
{
  email: string,
  password: string
}
```

**Response (200)**:
```typescript
{
  success: true,
  data: {
    user: { id, email, name, level },
    accessToken: string
  },
  timestamp: string
}
```

**Set-Cookie**: `refreshToken=...; HttpOnly; SameSite=Lax; Path=/`

**Error (401)**:
```typescript
{
  success: false,
  error: { code: 'AUTH_INVALID_CREDENTIALS', message: string }
}
```

### POST /auth/refresh

Refresh access token using HttpOnly cookie.

**Headers**: Cookie containing `refreshToken`

**Response (200)**:
```typescript
{
  success: true,
  data: { accessToken: string },
  timestamp: string
}
```

### POST /auth/logout

Invalidate refresh token session.

**Headers**: Cookie containing `refreshToken`

**Response (200)**:
```typescript
{ success: true, timestamp: string }
```

## Chat Endpoints (`/api/chat`)

**Authentication**: Optional for POST endpoints (visitors allowed with 2-prompt limit), Required for GET/DELETE

### POST /

Create a new conversation. Visitors can create up to 2 conversations before being required to log in.

**Request Body**:
```typescript
{
  initialMessage: string,  // 1-2000 characters
  subject: string,         // 'جبر و توابع' | 'معادله و نامعادله' | ...
  level: string,           // 'ریاضی فیزیک' | 'علوم تجربی' | 'انسانی و معارف'
  image?: {                // optional
    data: string,          // base64 encoded
    mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
  }
}
```

**Response (201)**:
```typescript
{
  success: true,
  data: {
    conversation: { id, subject, level, createdAt },
    message: { id, role: 'assistant', content, createdAt }
  },
  timestamp: string
}
```

### POST /:conversationId/message

Send a message in an existing conversation.

**Request Body**:
```typescript
{
  content: string,  // 1-4000 characters
  image?: { data: string, mimeType: string }
}
```

**Response (200)**:
```typescript
{
  success: true,
  data: {
    message: { id, role: 'assistant', content, createdAt }
  },
  timestamp: string
}
```

### GET /

List all conversations for the authenticated user.

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 20, max: 100)

**Response (200)**:
```typescript
{
  success: true,
  data: conversations: [{ id, subject, level, createdAt, updatedAt }],
  meta: { page, limit, total, totalPages },
  timestamp: string
}
```

### GET /:conversationId

Get conversation message history.

**Response (200)**:
```typescript
{
  success: true,
  data: {
    conversation: { id, subject, level },
    messages: [{ id, role, content, createdAt }]
  },
  timestamp: string
}
```

### DELETE /:conversationId

Delete a conversation and all its messages.

**Response (200)**:
```typescript
{ success: true, timestamp: string }
```

## Question Endpoints (`/api/questions`)

**Authentication Required**: Yes - All endpoints require `Authorization: Bearer <token>`

### GET /

List questions with optional filters.

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | string | Page number (default: 1) |
| `limit` | string | Items per page (default: 20) |
| `subject` | string | Filter by subject |
| `level` | string | Filter by difficulty: 'آسان' | 'متوسط' | 'سخت' |
| `topic` | string | Filter by topic |
| `examYear` | string | Filter by exam year |
| `isVerified` | 'true' | 'false' | Filter verified status |

**Response (200)**:
```typescript
{
  success: true,
  data: questions: [{
    id, questionNumber, text, options, correctAnswer,
    subject, topic, level, examYear, imageUrl,
    attemptCount, correctCount, correctRate
  }],
  meta: { page, limit, total, totalPages },
  timestamp: string
}
```

### GET /search

Search questions with full-text search.

**Query Parameters**:
- `q` (required): Search query
- `page`, `limit`: Pagination
- `subject`, `level`: Filters

**Response (200)**:
```typescript
{
  success: true,
  data: questions: [...],
  meta: { page, limit, total, totalPages },
  timestamp: string
}
```

### GET /:id

Get single question by ID.

**Response (200)**:
```typescript
{
  success: true,
  data: {
    question: { id, text, options, correctAnswer, explanation, ... },
    userProgress?: { masteryLevel, attempts, correctAttempts }
  },
  timestamp: string
}
```

### POST /:id/submit

Submit answer for a question.

**Authentication Required**: Yes

**Request Body**:
```typescript
{
  answerIndex: number,  // 0-3
  timeSpentSeconds?: number
}
```

**Response (200)**:
```typescript
{
  success: true,
  data: {
    correct: boolean,
    correctAnswer: number,
    explanation: string,
    progress: {
      masteryLevel: number,
      srsInterval: number,
      nextReviewAt: string
    }
  },
  timestamp: string
}
```

## Favorites Endpoints (`/api/favorites`)

**Authentication Required**: All endpoints

### GET /

List user's favorite questions.

**Query Parameters**: `page`, `limit`

**Response (200)**:
```typescript
{
  success: true,
  data: favorites: [{
    id, questionId, notes, createdAt,
    question: { id, text, subject, level }
  }],
  meta: { page, limit, total, totalPages },
  timestamp: string
}
```

### POST /

Add question to favorites.

**Request Body**:
```typescript
{
  questionId: string,  // UUID
  notes?: string       // optional, max 1000 chars
}
```

**Response (201)**:
```typescript
{
  success: true,
  data: { id, questionId, notes, createdAt },
  timestamp: string
}
```

### DELETE /:questionId

Remove question from favorites.

**Response (200)**:
```typescript
{ success: true, timestamp: string }
```

### PATCH /:questionId

Update favorite notes.

**Request Body**:
```typescript
{
  notes: string  // 1-1000 characters
}
```

**Response (200)**:
```typescript
{
  success: true,
  data: { id, notes, updatedAt },
  timestamp: string
}
```

## User Endpoints (`/api/user`)

### GET /me

Get current authenticated user's profile.

**Authentication Required**: Yes

**Response (200)**:
```typescript
{
  success: true,
  data: {
    user: {
      id, email, name, level,
      createdAt, lastLoginAt
    }
  },
  timestamp: string
}
```

## Utility Endpoints

### GET /health

Health check endpoint (no auth required).

**Response (200)**:
```typescript
{
  success: true,
  data: {
    status: 'ok',
    timestamp: string,
    version: '1.0.0'
  }
}
```

### GET /api/test

Test endpoint.

**Response (200)**:
```typescript
{ success: true, message: 'API is working' }
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `AUTH_INVALID_CREDENTIALS` | 401 | Invalid email/password |
| `AUTH_TOKEN_EXPIRED` | 401 | JWT access token expired |
| `AUTH_UNAUTHORIZED` | 403 | User lacks permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `VISITOR_PROMPT_LIMIT_EXCEEDED` | 429 | Visitor prompt limit (2) exceeded |
| `AI_TIMEOUT` | 504 | AI service timeout |
| `AI_QUOTA_EXCEEDED` | 429 | API quota exceeded |
| `INTERNAL_ERROR` | 500 | Server error |
