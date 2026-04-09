# AI Entrypoint - MathKonkur AI

This document provides the essential navigation guide for AI agents working on this repository.

## What To Read First

1. **Start here**: `docs/SYSTEM_OVERVIEW.md` - High-level system map
2. **Then read**: `docs/backend/backend-overview.md` - Backend architecture
3. **Frontend overview**: `docs/frontend/frontend-overview.md` - React application structure

## Where To Find Key Components

### Backend Logic

| Component | Location |
|-----------|----------|
| API Routes | `backend/src/routes/*.routes.ts` |
| Controllers | `backend/src/controllers/*.controller.ts` |
| Services | `backend/src/services/*.service.ts` |
| Middleware | `backend/src/middleware/*.ts` |
| Configuration | `backend/src/config/env.ts` |

### Frontend Logic

| Component | Location |
|-----------|----------|
| Main App | `src/App.tsx` |
| API Client | `src/services/api.ts` |
| Auth Context | `src/contexts/AuthContext.tsx` |
| Components | `src/components/*.tsx` |

### Database Schema

- **Primary schema**: `backend/prisma/schema.prisma`
- **Migrations**: `backend/prisma/migrations/`

## API Routes Definition Files

All API routes are defined in `backend/src/routes/`:
- `auth.routes.ts` - `/api/auth/*`
- `chat.routes.ts` - `/api/chat/*`
- `question.routes.ts` - `/api/questions/*`
- `favorite.routes.ts` - `/api/favorites/*`
- `user.routes.ts` - `/api/user/*`

## Configuration Files

| File | Purpose |
|------|---------|
| `backend/.env.example` | Backend environment template |
| `.env.example` | Frontend environment template |
| `backend/src/config/env.ts` | Env validation (Zod) |
| `vite.config.ts` | Vite build configuration |
| `backend/tsconfig.json` | Backend TypeScript config |

## ⚠️ Critical Warnings

### Never Guess Configuration Values

- **Ports**: Use `env.PORT` from `backend/src/config/env.ts`, not hardcoded values
- **Database URL**: Must come from `DATABASE_URL` environment variable
- **API Keys**: Use `env.GAPGPT_API_KEY` from config
- **JWT Secrets**: Use `env.JWT_SECRET` and `env.JWT_REFRESH_SECRET`

### Never Assume

- **CORS origins**: Check `env.FRONTEND_URL` in `backend/src/config/env.ts`
- **Response formats**: Always use the standard format from `backend/src/utils/errors.ts`
- **Authentication flow**: Verify in `backend/src/middleware/auth.middleware.ts`

## Quick Reference

| Task | File |
|------|------|
| Add new API endpoint | Create in `backend/src/routes/` then mount in `backend/src/app.ts` |
| Add database model | Edit `backend/prisma/schema.prisma` then run `npm run db:migrate` |
| Add environment variable | Update `backend/.env.example` and `backend/src/config/env.ts` |
| Add frontend component | Create in `src/components/` then import in `src/App.tsx` |
| Modify auth logic | `backend/src/services/auth.service.ts` |

## Entry Points

- **Frontend**: `src/main.tsx` → `src/App.tsx`
- **Backend**: `backend/src/server.ts` → `backend/src/app.ts`
- **Database**: `backend/prisma/schema.prisma`

## File Reading Order for Common Tasks

### Adding a New API Endpoint
1. `backend/src/routes/template.routes.ts` (reference pattern)
2. `backend/src/controllers/template.controller.ts` (reference pattern)
3. `backend/src/services/template.service.ts` (business logic)
4. `backend/src/app.ts` (mounting)

### Modifying Database
1. `backend/prisma/schema.prisma` (current models)
2. `backend/src/config/database.ts` (Prisma client)
3. `backend/src/repositories/` (data access)

### Understanding Auth Flow
1. `backend/src/middleware/auth.middleware.ts`
2. `backend/src/controllers/auth.controller.ts`
3. `backend/src/services/auth.service.ts`
4. `src/contexts/AuthContext.tsx` (frontend)

---

**Always verify values in configuration files rather than guessing.**
