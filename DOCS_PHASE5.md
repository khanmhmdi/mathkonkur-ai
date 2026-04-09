# Phase 5: AI Core & Chat Infrastructure

This phase marks the implementation of the intelligent tutoring heart of MathKonkur AI. It orchestrates the flow from raw student input to structured AI reasoning, ensuring pedagogical integrity, security, and low-latency performance.

---

## 5.1 Prompts Layer (`tutor.system.ts`)
The prompt engineering layer separates AI's persona and logic from the business code.
- **Identity Enforcement**: Specifically defines the AI as "MathKonkur AI," a specialist for the Iranian university entrance exam (Konkur).
- **Pedagogical Strategy**: Enforces the **Socratic Method**. Instead of direct answers, the AI is instructed to ask leading questions and provide step-by-step guidance.
- **Strict LaTeX Formatting**: Mandatory use of `$` (inline) and `$$` (display) for all mathematical expressions to ensure compatibility with the frontend renderer.
- **Cultural/Linguistic Context**: Enforces 100% Persian (Farsi) responses, inclusive of "Exam Tips" (نکات کنکوری) and "Diagnostic Traps" (دام‌های آموزشی).
- **Context Constraints**: Defines `MAX_CONTEXT_MESSAGES = 10` and `MAX_TOKENS = 2048` to optimize cost and latency.

---

## 5.2 AI Service (`ai.service.ts`)
The technical integration with GapGPT LLM using OpenAI-compatible API.
- **Client Architecture**: Singleton wrapper for OpenAI SDK utilizing `GAPGPT_API_KEY` from the secure environment.
- **Resilient Execution Loop**:
  - **3-Attempt Policy**: Initial call plus 2 retries for transient failures.
  - **Exponential Backoff**: 1s and 2s delays between retries to mitigate rate-limiting.
  - **Dynamic Timeout**: Hard 30-second `AbortController` pulse to prevent dangling requests.
- **Intelligent Error Mapping**:
  - **429 (Quota)**: Fails fast without retrying.
  - **400 (Safety Block)**: Gracefully handles content blocks by GapGPT's safety filters.
  - **504 (Gateway Timeout)**: Specifically surfaces an "AI_TIMEOUT" error for the controller to handle.
- **Mathematical Extraction Engine**:
  - Uses Regex to identify and isolate display and inline LaTeX.
  - **Safety Scrutiny**: Validates balanced braces `{}` and blacklists dangerous TeX commands (e.g., `\write`, `\input`).
- **Observability**: Every generation logs metadata including `tokensUsed`, `processingTimeMs`, and approximate cost calculation per 1k tokens.

---

## 5.3 Chat logic & Persistence
Manages the long-term lifecycle of student-tutor interactions.

### Chat Repository (`chat.repository.ts`)
- **Prisma Data Layer**: Direct CRUD for `ChatConversation` and `ChatMessage` models.
- **Automatic Metadata**: Leverages Prisma's `@updatedAt` on conversations to naturally bubble active threads to the top of user lists.

### Chat Service (`chat.service.ts`)
- **Ownership Verification**: Before any operation (read/write/delete), the service verifies that `conversation.userId === request.userId`.
- **Sliding Window Memory**: Dynamically rebuilds the conversation context by fetching only the **last 10 messages**, ensuring the AI stays relevant during long threads without exceeding token budgets.
- **Title Orchestration**: Automatically distills the first 30 characters of the inaugural message into a thread title, stripping LaTeX and newlines for high-quality dashboard presentation.

---

## 5.4 Chat Controller & Routing
The public API surface for user-AI interactions.

### Controller (`chat.controller.ts`)
- **Request Handlers**:
  - `createConversation`: Initializes the DB record AND processed the first AI exchange in a single atomic-like sequence.
  - `sendMessage`: Standard message append loop with AI logic.
  - `getHistory` / `getConversations`: Provides paginated (default 20/50) responses to the frontend.
- **Multimodal Payload Handling**: Supports image uploads via **Base64** strings.
  - **Strict Size Guard**: Enforces a 5MB limit on incoming images before wasting AI bandwidth.
- **Localized Error Feedback**: Translates service-level timeout errors into friendly Persian messages: "هوش مصنوعی در حال پردازش است، لطفاً دوباره تلاش کنید."

### Routes (`chat.routes.ts`)
- **Strict Validation**:
  - Enforces enum values for Iranian specific subjects (e.g., "حسابان").
  - UUID Regex validation on all `:conversationId` parameters to prevent malformed DB queries.
  - `authenticate` middleware enforced on **all** chat endpoints.
- **Mounted**: Mounted globally under `/api/chat` in the central `app.ts` file.

---

## Phase 5 Verification Summary
- **Logical Integrity**: `chat.service.test.ts` verified that unauthorized users receive 403 blocks.
- **API Integrity**: `chat.controller.test.ts` verified that status codes (201, 413, 204) are emitted correctly under mock conditions.
- **Type Safety**: The entire Phase 5 codebase passed a clean `npx tsc --noEmit` check.
