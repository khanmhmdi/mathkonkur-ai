<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/acd4f837-d284-4bc6-be73-bac983efd44e

## Project Roadmap

### [Phase 0 (Completed)](DOCS_PHASE0.md)

Project infrastructure setup.

### [Phase 3: Auth System](DOCS_PHASE3.md)

### [Phase 4: Error Handling & Server](DOCS_PHASE4.md)

### [Phase 5: AI & Chat](DOCS_PHASE5.md)

### [Phase 6: Question Bank & SRS](DOCS_PHASE6.md)

### [Phase 7: Frontend-Backend Integration](DOCS_PHASE7.md)

### Phase 1: Database & Core Infrastructure

- [x] **Step 1.1**: Create Prisma Database Schema

- [x] **Step 1.2**: Execute Prisma Migration and Generate Client

### Phase 2: Error Handling & Utilities

- [x] **Step 2.1**: Custom Error Handling System

- [x] **Step 2.2**: API Response Formatter

- [x] **Step 2.3**: Logger Configuration

## Structure

- **[backend/](backend/README.md)**: Node.js/TypeScript backend API.

- **frontend/ (src/)**: Vite-based AI Studio frontend app.

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key

3. Run the app:
   `npm run dev`
