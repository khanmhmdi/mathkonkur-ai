# End-to-End Testing & QA Guide

This document outlines the manual and automated test scenarios required to verify the MathKonkur AI platform's integrity.

---

## Test Scenario 1: Complete Chat Flow

**Objective**: Verify end-to-end conversation persistence and AI reasoning.

### Gherkin Scenario

```gherkin
Scenario: User has full conversation with persistence
  Given User is logged in with valid token
  When User navigates to home page
  And User clicks "شروع حل تست و رفع اشکال"
  Then Chat interface opens with empty state
  
  When User types "حل کن x^2 + 5x + 6 = 0" and sends
  Then User sees their message immediately
  And User sees loading indicator
  And User sees AI response within 10 seconds
  
  When User refreshes the browser page
  Then Conversation history loads from backend
  And Previous messages are visible
  
  When User sends second message "راه حل دیگه هم داره؟"
  Then AI responds considering previous context
  And New message appears in history after refresh

```

### Verification Checklist

- [ ] `POST /chat` creates conversation (first message)

- [ ] `POST /chat/:id/message` adds to existing thread

- [ ] `GET /chat/:id` returns full history on reload

- [ ] Messages display with correct RTL (Right-to-Left) formatting

- [ ] LaTeX ($...$) renders correctly from backend response

---

## Test Scenario 2: Authentication & Token Refresh

**Objective**: Ensure the user session stays alive without manual re-login.

### Gherkin Scenario

```gherkin
Scenario: Token refresh works seamlessly
  Given User is logged in
  And Access token is expired (simulate by deleting from localStorage)
  When User sends a chat message
  Then System automatically calls POST /auth/refresh
  And Original request retries automatically
  And User sees response without re-login
  
  When Refresh token is also expired (simulate cookie clearing)
  Then User is redirected to login page
  And Persian error message shows: "نشست شما منقضی شده"

```

### Verification Checklist

- [ ] `401 Unauthorized` triggers `/auth/refresh` automatically.

- [ ] **Queueing**: Sending 3 concurrent messages with an expired token results in only 1 refresh call followed by 3 successful retries.

- [ ] Failed refresh leads to a clean logout and redirect to `/login`.

---

## Test Scenario 3: Question Bank & Favorites

**Objective**: Verify cross-session data consistency.

### Gherkin Scenario

```gherkin
Scenario: Favorites sync across devices/sessions
  Given User is on Question Bank page
  When User clicks star on Question #5
  Then Star fills with color
  And POST /favorites called with 200 status
  
  When User opens app in incognito window and logs in
  And Navigates to Question Bank
  Then Question #5 shows filled star (loaded from API)
  
  When User unfavorites Question #5 in incognito
  And Returns to first window and refreshes
  Then Star is now empty (synced)

```

### Verification Checklist

- [ ] **Zero LocalStorage**: No `konkur_favorites` in Application tab (must be items in DB).

- [ ] `GET /favorites` returns accurate array on initial load.

- [ ] Subject/Level filters work against the dynamic backend-loaded dataset.

---

## Test Scenario 4: SRS Progress Tracking

**Objective**: Verify the SM-2 algorithm feedback loop.

### Gherkin Scenario

```gherkin
Scenario: Answering questions tracks progress
  Given User views Question #10
  When User selects wrong option
  And Clicks "مشاهده پاسخ تشریحی"
  Then POST /questions/10/submit called with isCorrect: false
  
  When User checks analytics dashboard
  Then Mastery level for that subject decreases or stays low
  
  When User selects correct answer
  Then POST /questions/10/submit called with isCorrect: true
  And Progress shows mastery increasing and nextReviewAt scheduled

```

---

## Final Security & Performance Checklist

1. **Security**:
   - [ ] No `GEMINI_API_KEY` in frontend build artifacts.
   - [ ] Refresh token cookie has `HttpOnly` and `Secure` flags.
   - [ ] CORS is restricted to the specific frontend production domain.

2. **Performance**:
   - [ ] Base64 images are capped (default 5MB) before submission.
   - [ ] API responses are compressed (Gzip/Brotli).
   - [ ] Question list supports efficient filtering (done via React state on loaded set).

---

## Build Commands

- **Frontend**: `npm run build` (Check for TS errors and bundle size).

- **Backend**: `npm run build` in `/backend` (Verifies Express/Prisma compilation).
