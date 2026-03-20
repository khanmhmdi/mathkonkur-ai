# Phase 7: Frontend-Backend Integration & QA

This final phase connects the reactive frontend components to the robust Express/Prisma backend, ensuring a seamless, data-driven experience with persistent sessions and automated recovery.

---

## 7.1 Resilient API Client (`src/services/api.ts`)

Instead of raw `fetch` calls, the project now uses a centralized Axios instance configured for production resilience.

### Key Features

1. **Automated Auth Injection**: A request interceptor automatically scans `localStorage` for the JWT access token and injects it into the `Authorization` header for every outgoing request.

2. **Atomic Token Refresh Queue**:
   - When a request fails with `401 Unauthorized`, the interceptor enters a "Refreshing" state.
   - It pauses all subsequent incoming requests and adds them to a `failedQueue`.
   - It executes a single `/auth/refresh` pulse (via HttpOnly cookies).
   - Upon success, it flushes the queue, retrying all original requests with the new token.
   - This prevents "token thrashing" where 10 concurrent requests would otherwise trigger 10 refresh calls.

3. **Persian Error Engine**:
   - Maps backend technical codes (e.g., `AI_TIMEOUT`, `AUTH_INVALID_CREDENTIALS`) to human-readable Persian messages.
   - Provides a fallback system for network-level failures ("خطای اتصال به سرور").

---

## 7.2 Frontend Component Refactoring

The core UI components were transitioned from static mocked data to the live backend stream.

### Chat Interface (`ChatInterface.tsx`)

- **Persistence**: New conversations are created via `POST /chat`, returning a unique `conversationId`.

- **History**: Subsequent messages are appended via `POST /chat/:id/message`.

- **Security**: Removed direct imports of the Gemini SDK and API keys from the frontend bundle. All LLM reasoning is now proxied and protected by the backend middleware.

### Question Bank (`QuestionBank.tsx`)

- **Dynamic Loading**: Fetches the full question bank from the server on mount, supporting real-time updates and synchronization.

- **Server-Side Favorites**: Starred status is no longer lost on browser clear-out. `toggleFavorite` now communicates directly with the `UserFavorite` table in Postgres.

- **SRS Tracking**: Integrates `recordAttempt` hooks. Selecting an answer or viewing an explanation sends telemetry to the backend, updating the student's Spaced Repetition mastery levels.

---

## 7.3 End-to-End Verification

A comprehensive QA strategy was established to ensure stability across deployments.

### Manual Test Scenarios (`DOCS_TESTING_GUIDE.md`)

- **Chat Flow**: Verifies history-preserving conversations across page refreshes.

- **Auth Flow**: Simulates expired tokens to verify the automated refresh "handshake".

- **Cross-Device Sync**: Verifies that favorites marked on one device appear immediately on another.

### Build & Security Certification

- **Frontend**: Successfully verified production bundling with `Vite`.

- **Backend**: Verified TypeScript compilation and Prisma client generation.

- **Database**: Confirmed the 31-question migration from static assets to the live PostgreSQL store.

- **Security Audit**: Confirmed `HttpOnly` cookie isolation for refresh tokens and CORS policy enforcement.
