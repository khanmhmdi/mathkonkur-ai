# System Boundaries

This document defines the boundaries between subsystems and external systems.

## Subsystem Boundaries

### Frontend Subsystem

**Boundary**: User interface layer

**Owned by**:
- `src/components/` - UI components
- `src/contexts/` - State management
- `src/services/` - API communication

**Exposes**:
- React components to user
- API endpoints via Axios
- Auth state via Context

**Depends on**:
- Backend API (`http://localhost:4000/api`)
- Browser APIs (localStorage, cookies)

### Backend Subsystem

**Boundary**: API and business logic layer

**Owned by**:
- `backend/src/routes/` - API endpoints
- `backend/src/controllers/` - Request handling
- `backend/src/services/` - Business logic

**Exposes**:
- REST API endpoints
- Health check endpoint

**Depends on**:
- Database (PostgreSQL via Prisma)
- External AI service (GapGPT API)
- Environment configuration

### Database Subsystem

**Boundary**: Data persistence layer

**Owned by**:
- `backend/prisma/schema.prisma` - Schema definition
- `backend/src/config/database.ts` - Client management

**Exposes**:
- Prisma Client for queries

**Depends on**:
- PostgreSQL database server

## External System Boundaries

### GapGPT AI Service

**Boundary**: External AI provider

**Interface**: OpenAI-compatible REST API

**Endpoint**: `https://api.gapgpt.app/v1`

**Model**: `gapgpt-qwen-3.5`

**Integration**: `backend/src/services/ai.service.ts`

**Capabilities**:
- Math tutoring responses
- LaTeX formula generation
- Image processing (base64)

**Limitations**:
- 30-second timeout
- 2048 max tokens
- Persian language responses only

### PostgreSQL Database

**Boundary**: Relational data storage

**Interface**: Prisma ORM

**Connection**: via `DATABASE_URL` environment variable

**Schema**: `backend/prisma/schema.prisma`

**Capabilities**:
- ACID transactions
- Full-text search
- Foreign key constraints
- Index optimization

### Browser Environment

**Boundary**: Client runtime

**Interface**: Web APIs

**Capabilities**:
- localStorage for tokens
- HTTP requests (Axios)
- React rendering
- CSS rendering (Tailwind)

## Data Ownership

| Data Type | Owner | Storage |
|-----------|-------|---------|
| User accounts | Backend | `users` table |
| Sessions | Backend | `sessions` table |
| Conversations | Backend | `chat_conversations` table |
| Messages | Backend | `chat_messages` table |
| Questions | Backend | `questions` table |
| Favorites | Backend | `user_favorites` table |
| Progress | Backend | `user_progress` table |
| Access token | Frontend | localStorage |
| Refresh token | Backend | HttpOnly cookie |

## API Contract

### Frontend → Backend

**Base URL**: `http://localhost:4000/api`

**Authentication**: Bearer token in `Authorization` header

**Content-Type**: `application/json`

**Response Format**:
```typescript
{
  success: true,
  data: T,
  meta?: { page, limit, total, totalPages }
}
```

**Error Format**:
```typescript
{
  success: false,
  error: { code, message, details? }
}
```

### Backend → GapGPT API

**Base URL**: `https://api.gapgpt.app/v1`

**Authentication**: Bearer token in `Authorization` header

**Model**: `gapgpt-qwen-3.5`

**Timeout**: 30 seconds

## Cross-Subsystem Protocols

### Auth Protocol

1. Frontend sends credentials to `/api/auth/login`
2. Backend validates and returns access token + sets refresh cookie
3. Frontend stores access token in localStorage
4. Frontend includes access token in subsequent requests
5. Access token expires → Frontend uses refresh cookie to get new access token

### Chat Protocol

1. Frontend sends message to `/api/chat/:id/message`
2. Backend validates and stores message
3. Backend calls GapGPT API with conversation context
4. GapGPT returns response
5. Backend stores response and returns to frontend

### Database Protocol

1. Backend creates Prisma client instance
2. Prisma client manages connection pool
3. Queries are executed via Prisma API
4. Prisma generates optimized SQL
5. Results returned as typed objects

## Security Boundaries

### Public Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /health`
- `GET /api/questions` (optional auth)

### Protected Endpoints

All endpoints under `/api/chat`, `/api/favorites`, `/api/user` require authentication via Bearer token.

### CORS Boundary

Backend only accepts requests from `FRONTEND_URL` environment variable.

### Cookie Boundary

Refresh tokens stored in HttpOnly cookies, inaccessible to JavaScript.
