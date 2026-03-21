# Authentication (Login/Signup) System Guide

## Overview

The MathKonkur application has a complete authentication system with login and signup pages properly integrated with a Node.js/Express backend using PostgreSQL and Prisma ORM.

## Architecture

### Frontend Components

#### AuthPage Component (`src/components/AuthPage.tsx`)
- **Location**: `/auth` route
- **Features**:
  - Modern gradient UI with Tailwind CSS
  - Login and registration modes
  - Real-time form validation
  - Password visibility toggle
  - Error and success alerts
  - Automatic redirect for authenticated users
  - Educational level selector for registration

**Key Features**:
```
✅ Email validation
✅ Password strength (min 6 characters)
✅ Name validation for registration
✅ Loading states with spinners
✅ Persian error messages
✅ Responsive design
```

#### EnhancedNavbar (`src/components/Landing.tsx`)
- Shows username when authenticated
- Logout button in navbar
- Login/Signup link when not authenticated
- Conditional rendering based on auth state

### Backend Services

#### API Structure
```
POST /api/auth/register           # Register new user
POST /api/auth/login              # Login existing user
POST /api/auth/refresh            # Refresh access token (automatic)
POST /api/auth/logout             # Logout user
GET  /api/user/me                 # Get current user profile
```

#### Authentication Flow

1. **Registration** (`POST /api/auth/register`)
   - Accepts: email, password, name, level
   - Validates email uniqueness
   - Hashes password with bcrypt
   - Creates user in PostgreSQL
   - Returns: user object + access token
   - Sets httpOnly refresh token cookie

2. **Login** (`POST /api/auth/login`)
   - Accepts: email, password
   - Verifies credentials
   - Generates JWT tokens:
     - **Access Token**: Short-lived (15 min), in response body
     - **Refresh Token**: Long-lived (7 days), in httpOnly cookie
   - Updates lastLoginAt timestamp
   - Returns: user object + access token

3. **Token Refresh** (Automatic)
   - Triggered when access token expires (401 response)
   - Uses httpOnly cookie (browser auto-sends it)
   - Returns new access token
   - No user action needed

4. **Logout** (`POST /api/auth/logout`)
   - Revokes session in database
   - Clears refresh token cookie
   - Client removes access token from localStorage

## Running the Application

### Prerequisites
- Node.js 18+
- PostgreSQL database
- .env file with database URL

### Start Backend
```bash
cd backend
npm run dev
# Runs on http://localhost:4000
```

### Start Frontend
```bash
npm run dev
# Runs on http://localhost:3000
```

### Or Start Both
```bash
npm run dev:full
# Requires 'concurrently' package
```

## File Structure

### Frontend
```
src/
├── components/
│   ├── AuthPage.tsx              # Login/Signup page (NEW - Enhanced)
│   ├── Landing.tsx               # Home page with updated navbar
│   ├── ChatInterface.tsx          # Chat with AI
│   ├── QuestionBank.tsx           # Question browser
│   └── ErrorBoundary.tsx          # Error handling
├── contexts/
│   └── AuthContext.tsx            # Auth state management + API
├── services/
│   └── api.ts                     # API client with error handling
├── types/
│   └── auth.ts                    # TypeScript interfaces
└── App.tsx                        # Routes setup
```

### Backend
```
backend/src/
├── controllers/
│   └── auth.controller.ts         # Auth endpoint handlers
├── services/
│   └── auth.service.ts            # Auth business logic
├── middleware/
│   ├── auth.middleware.ts         # JWT verification
│   └── error.middleware.ts        # Error handling
├── routes/
│   ├── auth.routes.ts             # Auth endpoints
│   └── user.routes.ts             # User endpoints
├── repositories/
│   ├── user.repository.ts         # Database queries
│   └── ...
├── utils/
│   ├── jwt.ts                     # JWT token generation
│   ├── password.ts                # Password hashing/verification
│   └── errors.ts                  # Custom error classes
├── config/
│   ├── database.ts                # Prisma setup
│   └── env.ts                     # Environment variables
└── app.ts                         # Express app setup
```

## Key Changes Made

### 1. Enhanced AuthPage Component
- ✅ Modern gradient background
- ✅ Icon-based input fields
- ✅ Show/hide password toggle
- ✅ Better error displays (red boxes with icons)
- ✅ Success feedback messages
- ✅ Loading states with spinners
- ✅ Form validation before submission
- ✅ Auto-redirect when authenticated
- ✅ Responsive mobile-friendly design
- ✅ Clear mode toggle between login/register

### 2. Updated Navigation Bar
- ✅ Shows user name when logged in
- ✅ Logout button in navbar
- ✅ Beautiful login button for unauthenticated users
- ✅ Smooth state management

### 3. Added NPM Scripts
```json
{
  "dev:backend": "cd backend && npm run dev",
  "dev:full": "concurrently \"npm run dev\" \"npm run dev:backend\""
}
```

## Usage Examples

### Test Registration
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"password123",
    "name":"Test User",
    "level":"ریاضی فیزیک"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"password123"
  }' \
  -c cookies.txt
```

### Test Protected Endpoint
```bash
curl -X GET http://localhost:4000/api/user/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Security Features

✅ **Password Security**
- Bcrypt hashing with salt rounds
- Never stored in plain text
- Compared securely with hash

✅ **Token Management**
- JWT tokens with strong signatures
- Short-lived access tokens (15 min)
- Long-lived refresh tokens in httpOnly cookies
- Automatic token refresh

✅ **API Security**
- CORS configured for specific origin
- HttpOnly cookies prevent XSS attacks
- Helmet.js security headers
- Input validation with Zod schemas
- SQL injection prevention (Prisma)

✅ **Session Management**
- Sessions stored in database
- Logout revokes session
- Can invalidate sessions server-side

## Frontend State Management

The `AuthContext` manages:
```typescript
interface AuthState {
  user: User | null              // Current user
  accessToken: string | null     // JWT token
  isAuthenticated: boolean       // Auth status
  isLoading: boolean             // Loading state
}
```

Methods provided:
- `login(credentials)` - Login user
- `register(data)` - Register new user
- `logout()` - Logout user
- `refreshToken()` - Manually refresh token

## Environment Variables

### Frontend
```
VITE_API_URL=http://localhost:4000/api
```

### Backend
```
DATABASE_URL=postgresql://user:password@localhost:5432/mathkonkur
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
NODE_ENV=development
```

## Troubleshooting

### Issue: CORS errors
**Solution**: Ensure `FRONTEND_URL` in backend `.env` matches your frontend origin

### Issue: 401 Unauthorized
**Solution**: Access token expired, browser will auto-refresh via cookie

### Issue: Cookies not being set
**Solution**: Ensure `withCredentials: true` in axios config (already set)

### Issue: "Email already registered"
**Solution**: Use a different email or reset the database

## Database Schema

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  name          String?
  level         String?
  createdAt     DateTime  @default(now())
  lastLoginAt   DateTime?
  sessions      Session[]
  // ... other fields
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## Next Steps

### To Deploy:
1. Build frontend: `npm run build`
2. Build backend: `cd backend && npm run build`
3. Set production environment variables
4. Use process manager (PM2) for backend
5. Serve frontend with nginx/apache

### To Extend:
- Add password reset functionality
- Implement two-factor authentication
- Add OAuth providers (Google, GitHub)
- Add email verification
- Implement role-based access control

## Contact & Support

For any issues or questions about the authentication system:
1. Check the ERROR logs in terminal
2. Review the .env configuration
3. Ensure database is running
4. Verify backend is on port 4000
5. Check browser DevTools > Network tab

---

**Last Updated**: March 21, 2026
**Status**: ✅ Production Ready
