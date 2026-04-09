# MathKonkur AI - Project Overview

A comprehensive AI-powered math tutoring platform for Iranian university entrance exam (Konkur) preparation. The system provides AI-driven math tutoring, question bank management, and spaced repetition learning.

---

## 1. Project Overview

MathKonkur AI is a full-stack web application designed to help students prepare for the Iranian math konkur (کنکور) exam. The platform features:

- **AI Math Tutor**: Conversational AI that explains math problems step-by-step using LaTeX-formatted formulas
- **Question Bank**: Database of Konkur math questions with filtering and search capabilities
- **Spaced Repetition System (SRS)**: SM-2 algorithm implementation for optimal learning retention
- **Favorites & Progress Tracking**: User-specific tracking of learning progress
- **Persian Localization**: Full Persian/Farsi language support

**Problem Solved**: Provides accessible, AI-powered math education for Konkur preparation with structured learning paths and progress tracking.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React + Vite)                 │
│  src/components/  │  src/contexts/  │  src/services/        │
│  - ChatInterface   │  - AuthContext  │  - api.ts            │
│  - QuestionBank    │                 │                      │
│  - AuthPage         │                 │                      │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP API (REST)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Express + TypeScript)             │
│  src/routes/  │  src/controllers/  │  src/services/         │
│  - auth        │  - auth.controller │  - ai.service.ts      │
│  - chat        │  - chat.controller │  - auth.service.ts    │
│  - questions   │  - question.ctrl   │  - progress.service   │
│  - favorites   │  - favorite.ctrl   │  - question.service   │
│  - user        │                    │                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database (PostgreSQL + Prisma ORM)         │
│  - users  │  sessions  │  chat_conversations  │  messages │
│  - questions  │  user_favorites  │  user_progress          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              External Services                               │
│  - GapGPT API (https://api.gapgpt.app/v1) - AI responses    │
└─────────────────────────────────────────────────────────────┘
```

**Technology Stack**:

| Layer | Technology |
|-------|------------|
| Frontend Runtime | Node.js (ES2022) |
| Frontend Framework | React 19 |
| Frontend Build | Vite 6.2 |
| Styling | Tailwind CSS 4 |
| Backend Runtime | Node.js (ES2022) |
| Backend Framework | Express 4.21 |
| Language | TypeScript 5.8 |
| Database | PostgreSQL |
| ORM | Prisma 6.4 |
| Validation | Zod |
| Authentication | JWT (access + refresh tokens) |
| AI Service | GapGPT API (OpenAI-compatible) |
| Logging | Pino + pino-pretty |

---

## 3. Repository Structure

```
mathkonkur-ai/
├── .env.example                    # Root env vars (VITE_GAPGPT_API_KEY, APP_URL)
├── package.json                    # Frontend scripts & dependencies
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # Frontend TypeScript config
├── jest.config.js                  # Jest test configuration
├── AI_PROJECT_OVERVIEW.md          # This documentation
├── README.md                        # Project README
├── index.html                       # Entry HTML
│
├── src/                            # Frontend source
│   ├── main.tsx                    # App entry point
│   ├── App.tsx                     # Main app component with routing
│   ├── index.css                   # Global styles (Tailwind)
│   ├── components/                 # React components
│   │   ├── AuthPage.tsx           # Login/signup UI
│   │   ├── AuthTestComponent.tsx  # Auth testing component
│   │   ├── ChatInterface.tsx      # AI chat interface
│   │   ├── ErrorBoundary.tsx      # React error boundary
│   │   ├── Landing.tsx            # Landing page (Navbar + Hero)
│   │   └── QuestionBank.tsx       # Question browser component
│   ├── contexts/                  # React contexts
│   │   └── AuthContext.tsx        # Authentication state management
│   ├── services/                  # API services
│   │   └── api.ts                 # Axios-based API client
│   ├── data/                      # Static data
│   │   └── questions.ts           # Sample questions data
│   ├── types/                     # TypeScript types
│   └── utils/                     # Utility functions
│
├── backend/                        # Backend application
│   ├── package.json               # Backend scripts & dependencies
│   ├── tsconfig.json              # Backend TypeScript config
│   ├── .env.example               # Backend environment template
│   ├── .env                       # Backend environment (gitignored)
│   ├── README.md                  # Backend documentation
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── seed.ts               # Database seeding script
│   └── src/
│       ├── server.ts              # Server entry point
│       ├── app.ts                 # Express app configuration
│       ├── config/                # Configuration modules
│       │   ├── env.ts             # Environment validation (Zod)
│       │   ├── database.ts        # Prisma client singleton
│       │   └── logger.ts          # Pino logger config
│       ├── routes/                # API route definitions
│       │   ├── auth.routes.ts     # /api/auth endpoints
│       │   ├── chat.routes.ts     # /api/chat endpoints
│       │   ├── question.routes.ts # /api/questions endpoints
│       │   ├── favorite.routes.ts # /api/favorites endpoints
│       │   └── user.routes.ts     # /api/user endpoints
│       ├── controllers/           # Request handlers
│       │   ├── auth.controller.ts
│       │   ├── chat.controller.ts
│       │   ├── question.controller.ts
│       │   ├── favorite.controller.ts
│       │   └── user.controller.ts
│       ├── services/              # Business logic
│       │   ├── ai.service.ts      # GapGPT API integration
│       │   ├── auth.service.ts    # Auth operations
│       │   ├── chat.service.ts    # Chat operations
│       │   ├── question.service.ts
│       │   └── progress.service.ts
│       ├── middleware/            # Express middleware
│       │   ├── auth.middleware.ts # JWT authentication
│       │   ├── validate.middleware.ts # Zod validation
│       │   └── error.middleware.ts # Error handling
│       ├── repositories/          # Data access layer
│       ├── utils/                 # Utilities
│       │   ├── errors.ts          # Custom error classes
│       │   ├── jwt.ts             # JWT utilities
│       │   └── helpers.ts
│       └── prompts/               # AI prompts
│           └── tutor.system.ts    # System prompt for AI tutor
│
└── docs/                          # Documentation files
    ├── DOCS_PHASE0.md through DOCS_PHASE7.md
    ├── AUTHENTICATION_GUIDE.md
    └── TESTING_GUIDE.md
```

**Key Directory Purposes**:

| Directory | Purpose |
|-----------|---------|
| `src/components/` | Reusable React UI components |
| `src/contexts/` | React context providers (Auth state) |
| `src/services/` | API client and external service integrations |
| `backend/src/routes/` | API endpoint definitions |
| `backend/src/controllers/` | HTTP request handlers |
| `backend/src/services/` | Business logic and external service calls |
| `backend/src/middleware/` | Express middleware (auth, validation, errors) |
| `backend/src/repositories/` | Database access abstraction |
| `backend/src/config/` | App configuration (env, database, logger) |
| `backend/prisma/` | Database schema and migrations |

---

## 4. Configuration & Environment Variables

### Root Level (Frontend)

Located in `.env.example`:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_GAPGPT_API_KEY` | GapGPT API key for AI responses | `sk-...` |
| `APP_URL` | Application deployment URL | `https://app.example.com` |

### Backend Level

Located in `backend/.env.example`:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development`, `production`, `test` |
| `PORT` | Backend server port | `4000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/mathkonkur` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | Access token signing key (min 32 chars) | `your-super-secret-jwt-key-min-32-chars` |
| `JWT_REFRESH_SECRET` | Refresh token signing key (min 32 chars) | `your-refresh-secret-different-from-above` |
| `GAPGPT_API_KEY` | GapGPT API key for AI service | `sk-...` |
| `FRONTEND_URL` | CORS origin for frontend | `http://localhost:5173` |

**Configuration Loading**:

- Frontend: Uses Vite's `loadEnv` to inject `VITE_*` variables at build time
- Backend: Uses `dotenv` + Zod validation in `backend/src/config/env.ts`

---

## 5. Ports and Network Configuration

| Service | URL | Description |
|---------|-----|-------------|
| Frontend (dev) | `http://localhost:3000` | Vite dev server |
| Frontend (prod) | `http://localhost:5173` | Vite preview/production |
| Backend API | `http://localhost:4000/api` | Express API server |
| Health Check | `http://localhost:4000/health` | Server health endpoint |

**CORS Configuration**:

The backend is configured to accept requests only from `FRONTEND_URL`:
```typescript
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Frontend to Backend Communication**:

Frontend uses Axios with base URL configured via AuthContext. All API calls include:
- `Authorization: Bearer <access_token>` header
- `Content-Type: application/json` header
- Credentials enabled for cookie support

---

## 6. API Overview

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login user |
| POST | `/api/auth/refresh` | No | Refresh access token |
| POST | `/api/auth/logout` | No | Logout user |

**Register Payload**:
```typescript
{
  email: string,      // valid email
  password: string,  // min 6 chars
  name?: string,     // min 2 chars
  level?: 'ریاضی فیزیک' | 'علوم تجربی' | 'انسانی و معارف'
}
```

**Login Payload**:
```typescript
{
  email: string,
  password: string
}
```

### Chat Routes (`/api/chat`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/chat` | Yes | Create new conversation |
| POST | `/api/chat/:conversationId/message` | Yes | Send message |
| GET | `/api/chat` | Yes | List user's conversations |
| GET | `/api/chat/:conversationId` | Yes | Get conversation history |
| DELETE | `/api/chat/:conversationId` | Yes | Delete conversation |

**Create Conversation Payload**:
```typescript
{
  initialMessage: string,  // 1-2000 chars
  subject: 'جبر و توابع' | 'معادله و نامعادله' | 'توابع و نمودارها' | 
           'مثلثات' | 'هندسه تحلیلی' | 'بردارها و هندسه' | 'حسابان' | 'گسسته و احتمال',
  level: 'ریاضی فیزیک' | 'علوم تجربی' | 'انسانی و معارف',
  image?: { data: string, mimeType: 'image/jpeg' | 'image/png' | 'image/webp' }
}
```

### Question Routes (`/api/questions`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/questions` | Optional | List questions with filters |
| GET | `/api/questions/search` | Optional | Search questions |
| GET | `/api/questions/:id` | Optional | Get single question |
| POST | `/api/questions/:id/submit` | Yes | Submit answer |

**Query Parameters for List**:
```typescript
{
  page?: string,
  limit?: string,
  subject?: string,
  level?: 'آسان' | 'متوسط' | 'سخت',
  topic?: string,
  examYear?: string,
  isVerified?: 'true' | 'false'
}
```

### Favorites Routes (`/api/favorites`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/favorites` | Yes | List user's favorites |
| POST | `/api/favorites` | Yes | Add favorite |
| DELETE | `/api/favorites/:questionId` | Yes | Remove favorite |
| PATCH | `/api/favorites/:questionId` | Yes | Update favorite note |

### User Routes (`/api/user`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/user/me` | Yes | Get current user profile |

### Utility Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check endpoint |
| GET | `/api/test` | No | Test endpoint |
| POST | `/api/test` | No | Test POST endpoint |

**Standard Response Format**:

Success Response:
```typescript
{
  success: true,
  data: T,
  meta?: {
    page?: number,
    limit?: number,
    total?: number,
    totalPages?: number
  }
}
```

Error Response:
```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any[]
  }
}
```

---

## 7. Application Startup

### Prerequisites

- Node.js (ES2022 compatible)
- PostgreSQL database
- Redis (optional, for caching)
- GapGPT API key (get from https://api.gapgpt.app)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your database URL and API keys

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed

# Start development server
npm run dev
```

### Frontend Setup

```bash
# From root directory

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Set VITE_GAPGPT_API_KEY

# Start development server
npm run dev

# Or start both frontend and backend together
npm run dev:full

# Build for production
npm run build

# Preview production build
npm run preview
```

### Available Scripts

**Root package.json**:
| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite --port=3000 --host=0.0.0.0` | Start frontend dev server |
| `dev:backend` | `cd backend && npm run dev` | Start backend dev server |
| `dev:full` | `concurrently "npm run dev" "npm run dev:backend"` | Start both servers |
| `build` | `vite build` | Build frontend for production |
| `preview` | `vite preview` | Preview production build |
| `clean` | `rm -rf dist` | Clean build artifacts |
| `lint` | `tsc --noEmit` | Type-check without emitting |
| `test` | `jest` | Run tests |

**Backend package.json**:
| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `nodemon src/server.ts` | Start backend with hot reload |
| `build` | `tsc` | Compile TypeScript |
| `start` | `node dist/server.js` | Run compiled server |
| `db:migrate` | `prisma migrate dev` | Run database migrations |
| `db:generate` | `prisma generate` | Generate Prisma client |
| `db:seed` | `ts-node prisma/seed.ts` | Seed database |
| `test` | `jest` | Run backend tests |

---

## 8. Key Modules

### Authentication System

**Files**:
- `backend/src/controllers/auth.controller.ts` - Register, login, refresh, logout handlers
- `backend/src/services/auth.service.ts` - Password hashing (bcrypt), token generation
- `backend/src/middleware/auth.middleware.ts` - JWT verification middleware
- `backend/src/utils/jwt.ts` - JWT token utilities
- `src/contexts/AuthContext.tsx` - Frontend auth state management

**Features**:
- JWT access tokens (short-lived) + refresh tokens (long-lived)
- HttpOnly cookies for refresh tokens
- Bearer token for access tokens
- Password hashing with bcrypt
- Session management with database storage

**Flow**:
1. User registers → Password hashed, user created
2. User logs in → Access token + refresh token issued
3. Access token expires → Use refresh token to get new access token
4. User logs out → Refresh token deleted from database

### AI Chat Service

**Files**:
- `backend/src/services/ai.service.ts` - GapGPT API integration
- `backend/src/services/chat.service.ts` - Conversation management
- `backend/src/prompts/tutor.system.ts` - System prompt for math tutor

**Features**:
- Conversational AI with math tutoring focus
- LaTeX formula support (inline `$...$` and display `$$...$$`)
- Image upload support (base64 encoded)
- Exponential backoff retry logic (3 attempts)
- 30-second timeout for AI responses
- Persian language responses

**AI Model**: `gapgpt-qwen-3.5` via GapGPT API (`https://api.gapgpt.app/v1`)

### Question Bank

**Files**:
- `backend/src/controllers/question.controller.ts` - Question CRUD operations
- `backend/src/services/question.service.ts` - Question business logic
- `backend/prisma/schema.prisma` - Question model definition
- `src/components/QuestionBank.tsx` - Frontend question browser

**Features**:
- Filter by subject, level, topic, exam year
- Full-text search (PostgreSQL)
- Answer submission with correctness checking
- LaTeX rendering for math content
- Progress tracking per question

### Spaced Repetition System (SRS)

**Files**:
- `backend/src/services/progress.service.ts` - SM-2 algorithm implementation
- `backend/prisma/schema.prisma` - UserProgress model

**Features**:
- SM-2 algorithm for optimal review scheduling
- Tracks: mastery level, interval, ease factor, repetitions
- Calculates next review date based on performance
- Streak tracking for user motivation

**SM-2 Parameters**:
- `masteryLevel` (0.0 - 1.0) - Current mastery percentage
- `srsInterval` (days) - Days until next review
- `srsEaseFactor` (default 2.5) - Difficulty multiplier
- `srsRepetitions` - Number of successful consecutive reviews

### Database Layer

**Files**:
- `backend/src/config/database.ts` - Prisma client singleton
- `backend/prisma/schema.prisma` - Full database schema
- `backend/src/repositories/` - Data access layer

**Models**:
- `User` - User accounts with level preference
- `Session` - Refresh token sessions
- `ChatConversation` - Chat threads
- `ChatMessage` - Individual messages
- `Question` - Question bank entries
- `UserFavorite` - User question bookmarks
- `UserProgress` - SRS progress tracking

---

## 9. Development Conventions

### File Naming

| Pattern | Example | Description |
|---------|---------|-------------|
| `*.routes.ts` | `auth.routes.ts` | Express route definitions |
| `*.controller.ts` | `auth.controller.ts` | Request handlers |
| `*.service.ts` | `auth.service.ts` | Business logic |
| `*.middleware.ts` | `auth.middleware.ts` | Express middleware |
| `*.schema.ts` | - | Zod validation schemas |
| `*.test.ts` | `auth.controller.test.ts` | Jest tests |

### Folder Organization

- `src/routes/` - Route definitions (mounted in app.ts)
- `src/controllers/` - HTTP request handling
- `src/services/` - Business logic and external services
- `src/middleware/` - Express middleware
- `src/repositories/` - Database operations
- `src/utils/` - Helper functions and constants
- `src/config/` - Configuration modules

### API Patterns

1. **Route Definition Pattern**:
```typescript
const router = Router();

// Validation schema
const schema = z.object({ ... });

// Route with middleware chain
router.post('/', authenticate, validate(schema), controller.handler);

export default router;
```

2. **Response Format**: Always use `{ success: true, data: ... }` for success

3. **Error Handling**: Use custom error classes from `utils/errors.ts`

4. **Authentication**: Bearer token in `Authorization` header

5. **Validation**: Zod schemas in routes, validated via `validate.middleware.ts`

### Configuration Style

- Environment variables validated with Zod in `config/env.ts`
- Required vars cause process.exit(1) if missing
- Default values provided for optional vars
- Frontend uses `VITE_` prefix for env vars

### Code Style

- TypeScript strict mode
- ES2022 target
- Async/await for promises
- try/catch with error propagation
- Descriptive variable names in Persian/Farsi for user-facing content

---

## 10. AI Agent Guidance

AI agents working on this codebase must:

### Before Editing Code

1. **read_file this document** - Understand the architecture before making changes
2. **Check environment variables** - Never hardcode values; use `env` from `backend/src/config/env.ts`
3. **Verify routes** - Check `backend/src/routes/*.routes.ts` for existing endpoints
4. **Check Prisma schema** - Database changes require migration

### Never Assume

- **Ports**: Use `env.PORT` from config, not hardcoded values
- **Paths**: Use path aliases or relative imports correctly
- **Endpoints**: Verify in route files, don't guess
- **Environment**: Check `NODE_ENV` for development vs production behavior
- **API keys**: Use `env.GAPGPT_API_KEY`, never hardcode

### Configuration Sources

- Backend env: `backend/.env` → `backend/src/config/env.ts`
- Frontend env: `.env` → Vite injects as `import.meta.env.VITE_*`
- Database: `DATABASE_URL` in Prisma schema

### When Making Changes

1. **Update this document** if architecture changes
2. **Run tests** (`npm test` in both root and backend)
3. **Type-check** (`npm run lint`)
4. **Database changes** require `npm run db:migrate`

### Common Patterns

- **Add new route**: Create in `routes/`, mount in `app.ts`
- **Add new service**: Create in `services/`, inject dependencies
- **Add new model**: Update Prisma schema, run migration
- **Add environment variable**: Update `backend/.env.example` and `backend/src/config/env.ts`

### Testing Commands

```bash
# Frontend tests
npm test

# Backend tests
cd backend && npm test

# Type checking
npm run lint
```

---

## Document Metadata

- **Last Updated**: March 2026
- **Repository**: mathkonkur-ai
- **Version**: 1.0.0
