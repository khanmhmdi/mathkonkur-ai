# Phase 3: Authentication & User Management Documentation

## Overview

Phase 3 established the core security and user management layers for the MathKonkur AI platform. We implemented high-security password handling, session-aware token rotation, and robust repository patterns for user data persistence.

## Accomplishments

### Step 3.1: Password Hashing Utility

- **Standard**: Implemented `backend/src/utils/password.ts` using `bcrypt`.

- **Configuration**: Hardcoded **12 salt rounds** to ensure long-term resistance against brute-force attacks.

- **Security**: Asynchronous hashing and strict whitespace trimming on comparison.

### Step 3.2: JWT Token Utility

- **Dual-Token System**: Implemented in `backend/src/utils/jwt.ts`.
  - **Access Tokens**: Short-lived (15 minutes), used for immediate authorization.
  - **Refresh Tokens**: Long-lived (7 days), stored in secure cookies for session persistence.

- **Security**: Used distinct secrets (`JWT_SECRET` and `JWT_REFRESH_SECRET`) and enforced HS256 algorithm.

### Step 3.3: User Repository

- **Data Access Layer**: Created `backend/src/repositories/user.repository.ts` using Prisma.

- **Normalization**: Automatic email lowercasing and strict data selection (never leaking `passwordHash` by accident).

- **Schema Update**: Added `lastLoginAt` field to track user activity.

### Step 3.4: Authentication Service (Business Logic)

- **Service Orchestration**: Implemented in `backend/src/services/auth.service.ts`.

- **Session Tracking**: Integrated a database-backed `Session` model to allow for instant revocation of refresh tokens (Logout functionality).

- **Workflows**: `register`, `login`, `refresh`, and `logout` flows verified with comprehensive integration tests.

### Step 3.5: Auth Controller (HTTP Layer)

- **RESTful Endpoints**: Created `backend/src/controllers/auth.controller.ts`.

- **Cookie Security**: Refresh tokens are served via **HttpOnly, SameSite=Strict** cookies to mitigate XSS and CSRF risks.

- **Response Safety**: Leverages the global `success()` helper for predictable JSON envelopes.

### Step 3.6: Auth Middleware

- **Protected Routes**: Implemented `backend/src/middleware/auth.middleware.ts` for JWT verification.

- **Flexibility**: Provided both `authenticate` (strict) and `optionalAuth` (graceful) guards.

- **Type Integration**: Extended Express `Request` type for global user data availability.

### Step 3.7: Routing & Validation

- **Unified Wiring**: Created `backend/src/routes/auth.routes.ts`.

- **Validation**: Integrated Zod schemas with Farsi error messages for a localized user experience.

- **Infrastructure Infrastructure**: Implemented `validate.middleware.ts` to provide a reusable schema-validation pipeline.

## System Verification Results

- **Unit Tests**: All utilities (`password`, `jwt`) and repositories passed 100%.

- **Integration Tests**: `auth.service.test.ts` confirmed the full lifecycle from registration to logout.

- **Big Picture Audit**:
  - Installed `cookie-parser` to support secure refresh flows.
  - Created standardized `error.middleware.ts`.
  - Unified the application via `src/app.ts` and `src/index.ts`.

## Next Steps

With Authentication fully wired, the project moves to **Phase 4: AI Tutoring Logic**, focusing on the Gemini API integration and chat conversation history persistence.
