# System Invariants

This document defines the invariants (unchanging properties) that must hold throughout the system.

## Authentication Invariants

### User Identity

1. **User ID Uniqueness**: Each user has a unique UUID (`users.id`)
   - Enforced by: Prisma `@id @default(uuid())`
   - Verified by: Database unique constraint

2. **Email Uniqueness**: Each user has a unique email
   - Enforced by: Prisma `@unique` on `email` field
   - Verified by: Database unique index

3. **Password Hashing**: Passwords are never stored in plaintext
   - Enforced by: `auth.service.ts` always uses bcrypt.hash()
   - Verified by: bcrypt.compare() on login

4. **Token Binding**: Refresh tokens are bound to sessions
   - Enforced by: `sessions` table links token to user
   - Verified by: Session lookup on token refresh

### Session Integrity

5. **Single Session Option**: User can have multiple active sessions
   - Enforced by: No session limit in code
   - Verified by: Multiple `sessions` rows per user allowed

6. **Token Expiration**: Access tokens expire after 15 minutes
   - Enforced by: `jwt.sign()` with `expiresIn: '15m'`
   - Verified by: Token expiration check in `auth.middleware.ts`

7. **Refresh Token Validity**: Refresh tokens expire after 7 days
   - Enforced by: `jwt.sign()` with `expiresIn: '7d'`
   - Verified by: Session expiry check

## API Invariants

### Request Format

8. **Content-Type**: All API requests use JSON
   - Enforced by: `app.use(express.json())`
   - Verified by: Content-Type header check

9. **Authorization Header**: Protected routes require Bearer token
   - Enforced by: `auth.middleware.ts` checks header format
   - Verified by: `Bearer ` prefix validation

### Response Format

10. **Success Response**: All successful responses follow `{ success: true, data: T }`
    - Enforced by: Controller pattern
    - Verified by: TypeScript interface `ApiResponse<T>`

11. **Error Response**: All errors follow `{ success: false, error: { code, message, details? } }`
    - Enforced by: `error.middleware.ts`
    - Verified by: `AppError` class structure

## Database Invariants

### Relationship Integrity

12. **Foreign Key Constraints**: Child records reference valid parents
    - Enforced by: Prisma `@relation` with `onDelete: Cascade`
    - Verified by: Database foreign key constraints

13. **User-Progress Uniqueness**: One progress record per user-question pair
    - Enforced by: Prisma `@@unique([userId, questionId])`
    - Verified by: Database unique constraint

14. **Favorite Uniqueness**: One favorite per user-question pair
    - Enforced by: Prisma `@@unique([userId, questionId])`
    - Verified by: Database unique constraint

### Data Consistency

15. **Correct Answer Range**: Questions have answers 0-3
    - Enforced by: Zod validation in `question.routes.ts`
    - Verified by: Database check (no constraint, relies on app logic)

16. **Mastery Level Range**: Progress masteryLevel is 0.0-1.0
    - Enforced by: SM-2 algorithm in `progress.service.ts`
    - Verified by: Math.min/max clamping

17. **Attempt Counts**: Counters never go negative
    - Enforced by: `increment()` operations in Prisma
    - Verified by: Database unsigned integers

## Validation Invariants

### Input Sanitization

18. **Email Format**: Valid email required for registration
    - Enforced by: Zod `z.string().email()`
    - Verified by: Regex validation

19. **Password Length**: Minimum 6 characters
    - Enforced by: Zod `z.string().min(6)`
    - Verified by: Length check

20. **Message Length**: Chat messages max 2000 chars (initial), 4000 chars (subsequent)
    - Enforced by: Zod `z.string().max(2000/4000)`
    - Verified by: Length validation

### Persian Localization

21. **Persian Error Messages**: All user-facing errors are in Persian
    - Enforced by: Zod error messages in Farsi
    - Verified by: Persian text in validation schemas

## Security Invariants

### Token Security

22. **HttpOnly Cookies**: Refresh tokens inaccessible to JavaScript
    - Enforced by: `httpOnly: true` in cookie options
    - Verified by: Browser DevTools (cookies not visible to JS)

23. **SameSite Cookies**: Refresh tokens use SameSite policy
    - Enforced by: `sameSite: 'lax'` in cookie options
    - Verified by: Cookie attributes

24. **CORS Restriction**: Backend only accepts requests from frontend origin
    - Enforced by: `cors({ origin: env.FRONTEND_URL })`
    - Verified by: Origin header check

### Password Security

25. **Bcrypt Hashing**: Passwords hashed with cost factor 10
    - Enforced by: `bcrypt.hash(password, 10)`
    - Verified by: Hash format (`$2b$10$...`)

## AI Service Invariants

### Response Format

26. **Persian Responses**: AI always responds in Persian
    - Enforced by: System prompt in `prompts/tutor.system.ts`
    - Verified by: Character check in `ai.service.ts`

27. **LaTeX Support**: AI responses support inline and display math
    - Enforced by: System prompt specifies LaTeX format
    - Verified by: `parseMathContent()` extraction

28. **Timeout Handling**: AI requests timeout after 30 seconds
    - Enforced by: `AbortController` with 30000ms timeout
    - Verified by: Timeout check in `ai.service.ts`

## Frontend Invariants

### State Management

29. **Auth State Consistency**: AuthContext reflects actual auth status
    - Enforced by: AuthContext checks localStorage + API validation
    - Verified by: Token validation on app load

30. **Single Auth Provider**: Only AuthContext manages auth state
    - Enforced by: All auth operations go through AuthContext
    - Verified by: No direct localStorage auth access in components

## Invariant Violation Handling

| Invariant | Violation | Handler |
|-----------|-----------|---------|
| User ID Uniqueness | Duplicate UUID | Database error (500) |
| Email Uniqueness | Duplicate email | Prisma error P2002 → 409 Conflict |
| Token Expiration | Expired token | 401 Unauthorized |
| Foreign Key | Invalid reference | Database error (500) |
| Validation Failure | Invalid input | 400 Bad Request with details |
| AI Timeout | 30s exceeded | 504 Gateway Timeout |
