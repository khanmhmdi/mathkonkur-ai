# Dependency Graph

This document maps the dependencies between modules and subsystems.

## Directories Dependency Map

```
src/
├── main.tsx
│   └── App.tsx
│       ├── components/
│       │   ├── AuthPage.tsx
│       │   ├── ChatInterface.tsx
│       │   ├── QuestionBank.tsx
│       │   ├── Landing.tsx
│       │   └── ErrorBoundary.tsx
│       ├── contexts/
│       │   └── AuthContext.tsx
│       └── services/
│           └── api.ts
```

```
backend/src/
├── server.ts
│   ├── app.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── chat.routes.ts
│   │   │   ├── question.routes.ts
│   │   │   ├── favorite.routes.ts
│   │   │   └── user.routes.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── chat.controller.ts
│   │   │   ├── question.controller.ts
│   │   │   ├── favorite.controller.ts
│   │   │   └── user.controller.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── ai.service.ts
│   │   │   ├── chat.service.ts
│   │   │   ├── question.service.ts
│   │   │   └── progress.service.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validate.middleware.ts
│   │   │   └── error.middleware.ts
│   │   └── config/
│   │       ├── env.ts
│   │       ├── database.ts
│   │       └── logger.ts
│   ├── utils/
│   │   ├── errors.ts
│   │   ├── jwt.ts
│   │   └── helpers.ts
│   └── prompts/
│       └── tutor.system.ts
```

## Module Dependencies

### Frontend Dependencies

| Module | Depends On |
|--------|-----------|
| `main.tsx` | React, ReactDOM, App, AuthContext |
| `App.tsx` | React Router, all components, contexts |
| `AuthContext.tsx` | axios, api.ts |
| `api.ts` | axios, AuthContext |
| `ChatInterface.tsx` | api.ts, AuthContext |
| `QuestionBank.tsx` | api.ts, AuthContext |
| `AuthPage.tsx` | api.ts, AuthContext |

### Backend Dependencies

| Module | Depends On |
|--------|-----------|
| `server.ts` | http, app, env, logger, prisma |
| `app.ts` | express, helmet, cors, cookie-parser, all routes |
| `auth.routes.ts` | express, auth.controller, validate.middleware, zod |
| `chat.routes.ts` | express, chat.controller, auth.middleware, zod |
| `auth.controller.ts` | auth.service, errors |
| `chat.controller.ts` | chat.service, ai.service |
| `auth.service.ts` | bcrypt, jwt, prisma, errors |
| `ai.service.ts` | openai, env, logger, errors, prompts |
| `auth.middleware.ts` | express, jwt, errors |
| `validate.middleware.ts` | express, zod, errors |
| `env.ts` | zod, dotenv |
| `database.ts` | prisma-client |

## External Dependencies

### Frontend package.json

| Dependency | Version | Purpose |
|------------|---------|---------|
| `react` | ^19.0.0 | UI framework |
| `react-dom` | ^19.0.0 | DOM rendering |
| `react-router-dom` | ^7.13.1 | Routing |
| `axios` | ^1.13.6 | HTTP client |
| `tailwindcss` | ^4.1.14 | Styling |
| `lucide-react` | ^0.546.0 | Icons |
| `motion` | ^12.23.24 | Animations |
| `katex` | ^0.16.11 | LaTeX rendering |
| `react-markdown` | ^10.1.0 | Markdown rendering |

### Backend package.json

| Dependency | Version | Purpose |
|------------|---------|---------|
| `express` | ^4.21.2 | Web framework |
| `@prisma/client` | ^6.4.1 | Database ORM |
| `bcrypt` | ^5.1.1 | Password hashing |
| `jsonwebtoken` | ^9.0.2 | JWT tokens |
| `zod` | ^3.24.2 | Validation |
| `cors` | ^2.8.5 | CORS middleware |
| `helmet` | ^8.0.0 | Security headers |
| `cookie-parser` | ^1.4.7 | Cookie parsing |
| `pino` | ^9.6.0 | Logging |
| `openai` | ^4.52.0 | AI API client |

## Service Dependencies

### Auth Service (`auth.service.ts`)

```typescript
Depends on:
├── bcrypt (password hashing)
├── jsonwebtoken (token generation)
├── prisma.user (database)
├── prisma.session (database)
└── errors (error classes)
```

### AI Service (`ai.service.ts`)

```typescript
Depends on:
├── openai (GapGPT API client)
├── env.GAPGPT_API_KEY
├── logger (logging)
├── prompts.tutor.system (system prompt)
└── errors (error classes)
```

### Chat Service (`chat.service.ts`)

```typescript
Depends on:
├── prisma.chat_conversation
├── prisma.chat_message
├── ai.service (AI responses)
└── errors (error classes)
```

### Question Service (`question.service.ts`)

```typescript
Depends on:
├── prisma.question
├── prisma.user_progress
└── errors (error classes)
```

## Data Flow Dependencies

### User Login Flow

```
AuthPage.tsx → api.ts → axios → POST /api/auth/login
           → auth.controller.ts → auth.service.ts
           → bcrypt (verify) → jwt (generate)
           → prisma.session (create)
           → Response → AuthContext.tsx
```

### Chat Message Flow

```
ChatInterface.tsx → api.ts → POST /api/chat/:id/message
                → chat.controller.ts → chat.service.ts
                → ai.service.ts → GapGPT API
                → prisma.message (create)
                → Response → ChatInterface.tsx
```

### Question List Flow

```
QuestionBank.tsx → api.ts → GET /api/questions
               → question.controller.ts → question.service.ts
               → prisma.question (findMany)
               → Response → QuestionBank.tsx
```

## Configuration Dependencies

| Config File | Loads | Validates |
|------------|-------|-----------|
| `backend/src/config/env.ts` | dotenv | Zod schema |
| `backend/src/config/database.ts` | PrismaClient | NODE_ENV |
| `backend/src/config/logger.ts` | pino | NODE_ENV |
| `vite.config.ts` | loadEnv | VITE_* vars |

## Runtime Dependencies

| Component | Requires | Started By |
|-----------|----------|------------|
| Frontend | Node.js, browser | `npm run dev` |
| Backend | Node.js, PostgreSQL | `npm run dev` (backend) |
| Database | PostgreSQL | External process |
| AI Service | GapGPT API key | External service |
