# System Overview - MathKonkur AI

## Project Purpose

MathKonkur AI is an AI-powered educational platform for Iranian university entrance exam (کنکور) preparation. It provides:

- **Conversational AI Tutor**: Explains math problems step-by-step with LaTeX-formatted formulas
- **Question Bank**: Database of math questions with filtering, search, and progress tracking
- **Spaced Repetition System (SRS)**: SM-2 algorithm for optimal learning retention
- **Persian Localization**: Full Farsi language support throughout

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React + Vite)                 │
│  Port: 3000 (dev) / 5173 (prod)                             │
│  Stack: React 19, Tailwind CSS 4, React Router 7            │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP REST API
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Express + TypeScript)              │
│  Port: 4000                                                  │
│  Stack: Express 4.21, TypeScript 5.8, Zod validation        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database (PostgreSQL + Prisma ORM)         │
│  Tables: users, sessions, chat_conversations, messages,     │
│         questions, user_favorites, user_progress            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              External Services                               │
│  GapGPT API (https://api.gapgpt.app/v1)                     │
│  Model: gapgpt-qwen-3.5                                     │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Version |
|-------|-------------|---------|
| Frontend Runtime | Node.js | ES2022 |
| Frontend Framework | React | 19.0.0 |
| Frontend Build | Vite | 6.2.0 |
| Styling | Tailwind CSS | 4.1.14 |
| Backend Runtime | Node.js | ES2022 |
| Backend Framework | Express | 4.21.2 |
| Language | TypeScript | 5.8.2 |
| Database | PostgreSQL | - |
| ORM | Prisma | 6.4.1 |
| Validation | Zod | 3.24.2 |
| Auth | JWT (bcrypt) | jsonwebtoken 9.0.2 |
| AI | GapGPT API | OpenAI-compatible |
| Logging | Pino | 9.6.0 |

## Repository Structure

```
mathkonkur-ai/
├── .env.example                    # Frontend env template
├── package.json                    # Frontend scripts
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # Frontend TypeScript
├── README.md                       # Project README
├── index.html                      # Entry HTML
├── src/                            # Frontend source
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Main app with routing
│   ├── index.css                   # Global styles
│   ├── components/                 # React components
│   ├── contexts/                   # React contexts
│   ├── services/                   # API services
│   ├── data/                       # Static data
│   └── utils/                      # Utilities
├── backend/                        # Backend application
│   ├── package.json               # Backend scripts
│   ├── .env.example               # Backend env template
│   ├── tsconfig.json              # Backend TypeScript
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── seed.ts                # Database seeding
│   └── src/
│       ├── server.ts              # Server entry
│       ├── app.ts                 # Express configuration
│       ├── config/                # Configuration
│       ├── routes/                # API routes
│       ├── controllers/           # Request handlers
│       ├── services/              # Business logic
│       ├── middleware/            # Express middleware
│       ├── repositories/          # Data access
│       ├── utils/                 # Utilities
│       └── prompts/               # AI prompts
└── docs/                          # This documentation
```

## Subsystem Overview

### Frontend Subsystem

**Location**: `src/`

**Responsibilities**:
- UI rendering with React components
- State management via React Context
- API communication via Axios
- Routing with React Router

**Key Components**:
- `AuthPage.tsx` - Login/signup UI
- `ChatInterface.tsx` - AI chat interface
- `QuestionBank.tsx` - Question browser
- `AuthContext.tsx` - Authentication state

### Backend Subsystem

**Location**: `backend/src/`

**Responsibilities**:
- REST API endpoints
- Business logic implementation
- Database operations
- External service integration (GapGPT)
- Authentication & authorization

**Key Modules**:
- `routes/` - API endpoint definitions
- `controllers/` - Request handlers
- `services/` - Business logic
- `middleware/` - Auth, validation, errors

### Database Subsystem

**Location**: `backend/prisma/schema.prisma`

**Responsibilities**:
- Data persistence
- Relationship management
- Query optimization via indexes
- Data integrity constraints

**Models**:
- `User` - User accounts
- `Session` - Refresh tokens
- `ChatConversation` - Chat threads
- `ChatMessage` - Messages
- `Question` - Question bank
- `UserFavorite` - Bookmarks
- `UserProgress` - SRS tracking

## System Constants

| Constant | Value | Location |
|----------|-------|----------|
| Frontend Port (dev) | 3000 | `package.json` scripts |
| Frontend Port (prod) | 5173 | `vite.config.ts` |
| Backend Port | 4000 | `backend/.env.example` |
| JWT Access Token | 15 min | `backend/src/utils/jwt.ts` |
| JWT Refresh Token | 7 days | `backend/src/utils/jwt.ts` |
| AI Timeout | 30 seconds | `backend/src/services/ai.service.ts` |
| AI Max Retries | 3 | `backend/src/services/ai.service.ts` |

## High-Level Data Flows

### User Authentication Flow

```
User Login → POST /api/auth/login → auth.controller → auth.service
         → bcrypt verify → JWT generation → Set-Cookie (refresh)
         → Response (access token + user data)
```

### Chat Message Flow

```
User Message → POST /api/chat/:id/message → chat.controller
          → chat.service → ai.service → GapGPT API
          → LaTeX parsing → Response (formatted answer)
```

### Question Retrieval Flow

```
GET /api/questions?subject=... → question.controller
                              → question.service
                              → Prisma query
                              → Response (paginated questions)
```

## Startup Instructions

### Prerequisites

- Node.js (ES2022 compatible)
- PostgreSQL database
- GapGPT API key (https://api.gapgpt.app)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with DATABASE_URL and GAPGPT_API_KEY
npm run db:generate
npm run db:migrate
npm run dev
```

### Frontend Setup

```bash
npm install
cp .env.example .env
# Set VITE_GAPGPT_API_KEY
npm run dev
```

### Full Stack

```bash
npm run dev:full
```

## Environment Variables

### Frontend (`.env.example`)

| Variable | Description |
|----------|-------------|
| `VITE_GAPGPT_API_KEY` | GapGPT API key |
| `APP_URL` | Application deployment URL |

### Backend (`backend/.env.example`)

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | development/production/test | Yes |
| `PORT` | Server port (default: 4000) | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `JWT_SECRET` | Access token secret (min 32 chars) | Yes |
| `JWT_REFRESH_SECRET` | Refresh token secret (min 32 chars) | Yes |
| `GAPGPT_API_KEY` | GapGPT API key | Yes |
| `FRONTEND_URL` | CORS origin | Yes |

## Where To Look For Specific Tasks

| Task | Location |
|------|----------|
| Authentication logic | `backend/src/services/auth.service.ts` |
| JWT token handling | `backend/src/utils/jwt.ts` |
| API routes definition | `backend/src/routes/*.routes.ts` |
| Request validation | `backend/src/middleware/validate.middleware.ts` |
| Error handling | `backend/src/middleware/error.middleware.ts` |
| Database schema | `backend/prisma/schema.prisma` |
| Prisma client | `backend/src/config/database.ts` |
| AI service integration | `backend/src/services/ai.service.ts` |
| Frontend routing | `src/App.tsx` |
| Frontend API client | `src/services/api.ts` |
| Auth state management | `src/contexts/AuthContext.tsx` |
| Chat UI | `src/components/ChatInterface.tsx` |
| Question bank UI | `src/components/QuestionBank.tsx` |
| Environment configuration | `backend/src/config/env.ts` |
| Logging | `backend/src/config/logger.ts` |

## API Endpoints Summary

| Route | Methods | Auth | Description |
|-------|---------|------|-------------|
| `/api/auth` | POST | No | Register, login, refresh, logout |
| `/api/chat` | GET, POST | Yes | Conversations CRUD |
| `/api/chat/:id/message` | POST | Yes | Send message |
| `/api/questions` | GET | Optional | List/search questions |
| `/api/questions/:id` | GET | Optional | Get question |
| `/api/questions/:id/submit` | POST | Yes | Submit answer |
| `/api/favorites` | GET, POST | Yes | Favorites CRUD |
| `/api/user/me` | GET | Yes | Get user profile |
| `/health` | GET | No | Health check |

## Documentation Navigation

```
docs/
├── AI_ENTRYPOINT.md           # Quick navigation guide
├── SYSTEM_OVERVIEW.md         # This file
├── architecture/              # System design
├── backend/                   # Backend documentation
├── frontend/                  # Frontend documentation
├── database/                  # Database documentation
├── testing/                   # Testing documentation
└── operations/                # Operations documentation
```
