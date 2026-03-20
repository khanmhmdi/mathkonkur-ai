# Phase 4: Core Middleware & Application Configuration

This document outlines the architecture and implementation details for Phase 4, which focused on establishing a robust observability suite, strict request validation, and a resilient server startup cycle.

## 1. Global Error Handling (`error.middleware.ts`)
The universal safety net for the application, enforcing a strict API contract format (`{ success: false, error: {...} }`).
- **Prisma Awareness**: Intercepts `P2002` (Unique Constraint) and maps it to a safe 400 Validation Error. Converts `P2025` to a 404 Not Found error.
- **Operational Precision**: Recognizes custom `AppError` subclasses (e.g., `AuthenticationError`, `ValidationError`) and extracts their inherent HTTP status codes.
- **Tiered Observability**: Utilizes the custom Pino logger to issue silent `warn` logs for client mistakes (4xx) and high-priority `error` logs with stack traces for internal system failures (500).

## 2. Request Validation (`validate.middleware.ts`)
A dynamic middleware factory enabling strict input curation.
- **Zod Synergy**: Accepts any Zod schema and enforces it asynchronously (`schema.parseAsync`) against `req.body`.
- **Error Normalization**: Dynamically transforms raw Zod failures into dot-notation paths (e.g., `user.address.street`), emitting a unified `ValidationError`.
- **Pipeline Integration**: Forwards validation rejections natively down the Express chain directly into the `error.middleware.ts` parser.

## 3. Central Application Setup (`app.ts`)
The orchestrator of the Express request pipeline. This module operates independently of network bindings, allowing for pure integration testing.
- **Strict Execution Order**:
  1. `Helmet`: HTTP Security Headers
  2. `CORS`: Cross-Origin strictness bounded by `env.FRONTEND_URL`
  3. `Parsers`: JSON & URL-Encoded buffers (hard-capped at 10MB)
  4. `Cookies`: `cookie-parser` for secure authorization token routing
  5. `Logger`: Audits incoming paths, IP, and User-Agents
  6. `Health Check`: Always-available `/health` pulse
  7. `API Routes`: Mounts Authentication and feature domains logic
  8. `404 Handler`: Catch-all wildcard generating bounded `NotFoundError`s
  9. `Error Handler`: The phase 4.1 middleware (Always absolute last)

## 4. Server Entry Point (`server.ts`)
The master bootloader. Manages exact lifecycle states separate from logic constraints.
- **Fail Fast Policy**: Actively refuses to bind HTTP ports if `prisma.$connect()` throws or if `EADDRINUSE` triggers.
- **Graceful Shutdown**: Traps `SIGTERM` and `SIGINT` signals. Upon activation:
  - Immediately rejects polling of new HTTP traffic.
  - Suspends until current connections terminate safely.
  - Gracefully closes standing PostgreSQL (`Prisma`) channels to prevent transaction leaking.
  - Employs a fixed 10-second guillotine timeout.
- **Unhandled Exceptions**: Installs strict observers for `uncaughtException` and `unhandledRejection`, preventing silent memory corruption.

## Big Picture Verification
- **Test Integrity**: Every major phase 4 block (`error`, `validate`, `app`, `server`) possesses an independent `.test.ts` suite.
- **Routing**: `auth.routes.ts` is explicitly mounted into `/api/auth` inside `app.ts`.
- **Nodemon Control**: Development scripts (`npm run dev`) dynamically point to the hardened `server.ts` entry.
