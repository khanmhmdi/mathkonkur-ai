# Phase 6: Dynamic Question Bank & SRS Infrastructure

This phase transitions the application from a static frontend-only prototype to a robust, data-driven learning platform with a server-side Spaced Repetition System (SRS).

---

## 6.1 Prisma Schema Expansion

The database schema was expanded to support a sophisticated learning loop.

- **`Question` Model**:
  - Supports LaTeX content (`textTeX`, `explanationTeX`) and structured `solutionSteps` (JSON).
  - Tracks global statistics: `attemptCount`, `correctCount`, and an atomic `correctRate`.
- **`UserFavorite` Model**: Enables students to bookmark difficult questions with personal notes.
- **`UserProgress` Model**: The core of the SRS.
  - Implements SM-2 fields: `srsInterval`, `srsEaseFactor`, `srsRepetitions`, and `nextReviewAt`.
  - Tracks student streaks (`currentStreak`, `maxStreak`) and `masteryLevel` (0-100%).

---

## 6.2 Intelligent Database Seeding (`prisma/seed.ts`)

The migration of 31 initial questions involved more than just copying data.

- **Step Parsing Engine**: Developed a regex-based parser that automatically breaks down long English/Persian explanations into a structured `solutionSteps` array (capped at 5 logical steps) for superior UI rendering.
- **ESM Optimization**: Localized the data source to `backend/src/data` to resolve `ERR_REQUIRE_ESM` conflicts, ensuring the seed script runs seamlessly in a Node.js CJS/TS environment.
- **Idempotency**: Implemented a row-count check before execution to prevent duplicate records during deployment.

---

## 6.3 Question Repository & Service

The brain of the retrieval system.

- **Advanced Retrieval**:
  - **PostgreSQL Randomization**: Uses `ORDER BY RANDOM()` via Prisma `$queryRaw` for unpredictable practice sets.
  - **Full-Text Search**: Case-insensitive search across `text`, `subject`, and `topic` using Prisma's `contains` mode.
- **Recommendation Engine**:
  - **30/40/30 Strategy**: Generates practice sets composed of 30% New questions, 40% Weak areas (Mastery < 50%), and 30% SRS Review (Due items).
- **Cheat Prevention**: Answer verification is moved strictly to the server. `getQuestionById` suppresses the `correctAnswer` field in public API responses.

---

## 6.4 Spaced Repetition (SRS) & Analytics

Implementation of the industry-standard SM-2 algorithm.

- **SRS Utility (`srs.ts`)**:
  - Pure function implementing the SuperMemo-2 logic.
  - Calculates intervals (1, 6, next*EF) and adjusts Ease Factor based on answer quality (0-5 scale mapped from time spent).
  - Handles the "Ease Factor Floor" (1.3) to prevent intervals from stagnating.
- **SQL Analytics Engine**:
  - **Grouped Aggregation**: Uses raw SQL joins to calculate accuracy and average time per subject without loading thousands of records into memory.
  - **Weekly Heatmap**: Generates a 7-day activity report (Attempts vs. Correct) with automatic zero-padding for inactive days.
  - **Mastery Distribution**: Categorizes student progress into "New" (0-29%), "Learning" (30-79%), and "Mastered" (80-100%).

---

## Phase 6 Verification Summary

- **Algorithmic Accuracy**: 11/11 tests in `srs.test.ts` verified correct interval growth and failure resets.
- **Service Integrity**: `progress.service.test.ts` and `question.service.test.ts` verified the recommendation allocation and streak logic.
- **Seeding Integrity**: `seed.test.ts` verified that the breakdown engine creates high-quality solution steps from raw text.
- **Type Safety**: Passed `npx tsc --noEmit` across all new repositories and services.
