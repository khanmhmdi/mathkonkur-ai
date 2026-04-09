# Backend Authentication

Complete authentication system documentation including JWT tokens, password hashing, and session management.

## Authentication Architecture

```
User Credentials
    ↓
POST /api/auth/login
    ↓
auth.controller.ts → auth.service.ts
    ↓
bcrypt.compare() → JWT generation
    ↓
Set HttpOnly Cookie (refresh) + Response (access)
    ↓
Frontend stores access in localStorage
```

## JWT Token System

**Files**:
- `backend/src/utils/jwt.ts` - Token utilities
- `backend/src/services/auth.service.ts` - Auth operations

### Token Types

| Token | Purpose | Expiration | Storage |
|-------|---------|------------|---------|
| **Access Token** | API authentication | 15 minutes | Frontend: localStorage |
| **Refresh Token** | Get new access token | 7 days | Backend: HttpOnly cookie |

### Token Structure

**Access Token Payload**:
```typescript
{
  userId: string;      // User UUID
  email: string;       // User email
  level: string;       // 'ریاضی فیزیک' | 'علوم تجربی' | 'انسانی و معارف'
  type: 'access';      // Token type identifier
  iat: number;         // Issued at timestamp
  exp: number;         // Expiration timestamp
}
```

**Refresh Token Payload**:
```typescript
{
  userId: string;
  sessionId: string;    // Session UUID
  type: 'refresh';
  iat: number;
  exp: number;
}
```

### Token Generation (`jwt.ts`)

```typescript
export function generateAccessToken(user: User): string {
  return jwt.sign(
    { userId: user.id, email: user.email, level: user.level, type: 'access' },
    env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

export function generateRefreshToken(user: User, sessionId: string): string {
  return jwt.sign(
    { userId: user.id, sessionId, type: 'refresh' },
    env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}
```

### Token Verification

```typescript
export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
}

export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JWTPayload;
}
```

## Password Hashing

**Algorithm**: bcrypt with cost factor 10

**File**: `backend/src/services/auth.service.ts`

### Hashing

```typescript
import bcrypt from 'bcrypt';

const passwordHash = await bcrypt.hash(password, 10);
// Output: $2b$10$...

const isValid = await bcrypt.compare(inputPassword, storedHash);
```

### Security Properties

- **Salt rounds**: 10 (2^10 iterations)
- **Hash format**: `$2b$10$<salt><hash>` (60 characters)
- **Time to hash**: ~100-300ms

## Session Management

**Model**: `Session` in Prisma schema

**File**: `backend/prisma/schema.prisma`

```prisma
model Session {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("sessions")
}
```

### Session Creation

```typescript
// In auth.service.ts register/login
const session = await prisma.session.create({
  data: {
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }
});
```

### Session Lookup

```typescript
// In auth.service.ts refresh
const session = await prisma.session.findUnique({
  where: { token: refreshToken }
});

if (!session || session.expiresAt < new Date()) {
  throw new AuthenticationError('نشست منقضی شده است');
}
```

### Session Deletion (Logout)

```typescript
await prisma.session.delete({
  where: { token: refreshToken }
});
```

## Authentication Flow

### Registration

```
1. User submits registration form
2. Backend validates input (Zod)
3. Check if email exists (Prisma unique)
4. bcrypt.hash(password) → passwordHash
5. prisma.user.create() → newUser
6. prisma.session.create() → refreshToken
7. generateAccessToken() → accessToken
8. Set HttpOnly cookie with refreshToken
9. Response: { user, accessToken }
```

### Login

```
1. User submits credentials
2. Find user by email (prisma.user.findUnique)
3. bcrypt.compare(password, user.passwordHash)
4. prisma.session.create() → refreshToken
5. generateAccessToken() → accessToken
6. Set HttpOnly cookie with refreshToken
7. Response: { user, accessToken }
```

### Token Refresh

```
1. Frontend detects 401 (expired access)
2. Frontend calls POST /api/auth/refresh
3. Browser sends HttpOnly cookie
4. Backend finds session by token
5. Verify session not expired
6. generateAccessToken() → newAccessToken
7. Response: { accessToken }
8. Frontend retries original request
```

### Logout

```
1. Frontend calls POST /api/auth/logout
2. Browser sends HttpOnly cookie
3. Backend deletes session
4. Response: { success: true }
5. Frontend clears localStorage
```

## Cookie Configuration

**File**: `backend/src/controllers/auth.controller.ts`

```typescript
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,      // JavaScript cannot access
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',     // CSRF protection
  path: '/',           // Available on all paths
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
});
```

### Cookie Attributes

| Attribute | Value | Purpose |
|-----------|-------|---------|
| `httpOnly` | `true` | Prevents XSS attacks |
| `secure` | `true` in production | HTTPS only |
| `sameSite` | `'lax'` | CSRF protection |
| `path` | `'/'` | Available globally |
| `maxAge` | 7 days | Expiration |

## Protected Routes

All routes under these paths require authentication:

| Path | Methods | Auth Required |
|------|---------|---------------|
| `/api/chat` | GET, POST, DELETE | Yes |
| `/api/chat/:id/message` | POST | Yes |
| `/api/questions/:id/submit` | POST | Yes |
| `/api/favorites` | GET, POST, DELETE, PATCH | Yes |
| `/api/user/me` | GET | Yes |

Optional auth (proceeds without user if no token):

| Path | Methods | Behavior |
|------|---------|----------|
| `/api/questions` | GET | Returns questions + user progress if authenticated |
| `/api/questions/:id` | GET | Returns question + user progress if authenticated |

## Error Handling

### Authentication Errors

| Error | Code | HTTP Status | Message |
|-------|------|------------|---------|
| Missing token | AUTH_UNAUTHORIZED | 401 | 'Authorization header required' |
| Invalid token | AUTH_UNAUTHORIZED | 401 | 'توکن نامعتبر است' |
| Expired token | AUTH_TOKEN_EXPIRED | 401 | 'توکن منقضی شده است' |
| Invalid credentials | AUTH_INVALID_CREDENTIALS | 401 | 'ایمیل یا رمز عبور اشتباه است' |
| Session expired | AUTH_UNAUTHORIZED | 401 | 'نشست منقضی شده است' |

## Security Considerations

### Implemented

1. **Password hashing**: bcrypt with salt rounds
2. **Token expiration**: Short-lived access tokens
3. **HttpOnly cookies**: Refresh tokens inaccessible to JS
4. **CORS restriction**: Only frontend origin
5. **Session binding**: Refresh tokens linked to sessions

### Best Practices

1. **HTTPS only**: Cookies marked secure in production
2. **CSRF protection**: SameSite attribute
3. **Token rotation**: New session on each login
4. **Graceful logout**: Session deletion on server

## Related Files

| File | Purpose |
|------|---------|
| `backend/src/middleware/auth.middleware.ts` | JWT verification middleware |
| `backend/src/controllers/auth.controller.ts` | Auth request handlers |
| `backend/src/services/auth.service.ts` | Auth business logic |
| `backend/src/utils/jwt.ts` | JWT utilities |
| `backend/prisma/schema.prisma` | Session model |
| `src/contexts/AuthContext.tsx` | Frontend auth state |
