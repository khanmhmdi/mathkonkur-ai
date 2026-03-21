# Quick Start: Login & Signup Integration

## What's Been Done ✅

### Frontend
- ✅ **Enhanced AuthPage component** (`src/components/AuthPage.tsx`)
  - Beautiful gradient UI with modern design
  - Login and signup modes
  - Form validation
  - Password visibility toggle  
  - Error/success messages
  - Responsive design

- ✅ **Updated Navbar** (`src/components/Landing.tsx`)
  - Shows user name when logged in
  - Logout button
  - Login link for guests

- ✅ **Auth Context** (`src/contexts/AuthContext.tsx`)
  - State management
  - Automatic token refresh
  - API integration

### Backend
- ✅ **Authentication endpoints**
  - POST `/api/auth/register` - Sign up
  - POST `/api/auth/login` - Sign in
  - POST `/api/auth/refresh` - Token refresh
  - POST `/api/auth/logout` - Sign out

- ✅ **Security**
  - Password hashing with bcrypt
  - JWT tokens with refresh rotation
  - HttpOnly cookies
  - CORS protection

## Running Now 🚀

### Terminal 1: Backend
```bash
cd backend
npm run dev
# http://localhost:4000
```

### Terminal 2: Frontend
```bash
npm run dev
# http://localhost:3000
```

### Both Together (optional)
```bash
npm run dev:full
```

## Test It Out 🧪

1. Go to `http://localhost:3000`
2. Click "ورود / ثبت‌نام" button in navbar
3. Test signup:
   - Enter name, email, password, level
   - Click "ایجاد حساب"
4. Test login:
   - Switch to "ورود" tab
   - Enter email, password
   - Click "ورود"
5. See your name in navbar → click خروج to logout

## Key Files Modified

```
src/components/
  ├── AuthPage.tsx              # ENHANCED
  └── Landing.tsx               # UPDATED (navbar auth)

backend/src/
  ├── controllers/
  │   └── auth.controller.ts    # Routes handlers
  ├── services/
  │   └── auth.service.ts       # Business logic
  └── routes/
      └── auth.routes.ts        # Endpoints
```

## Authentication Flow

```
User visits /auth
    ↓
AuthPage shows login/signup form
    ↓
User submits credentials
    ↓
Frontend → POST request to backend
    ↓
Backend validates & creates JWT
    ↓
Response: user + accessToken
    ↓
Frontend: stores token, redirects home
    ↓
Navbar shows user name + logout button
```

## API Examples

### Register
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "Your Name",
    "level": "ریاضی فیزیک"
  }'
```

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:4000/api/user/me \
  -H "Authorization: Bearer ACCESS_TOKEN_HERE"
```

## Common Issues

| Issue | Solution |
|-------|----------|
| CORS error | Check `FRONTEND_URL` in backend `.env` |
| 401 Unauthorized | Token expired, will auto-refresh |
| Email already registered | Use different email |
| Can't find /auth route | Make sure frontend is running |
| Backend not responding | Check port 4000 is available |

## Styling

The AuthPage uses:
- Tailwind CSS with RTL support
- Lucide icons for input fields
- CSS gradients
- Smooth animations
- Mobile responsive

Colors used:
- Primary: Indigo-600
- Accent: Blue-600
- Error: Red-600
- Success: Green-600

## What Users See

### Login/Signup Page (`/auth`)
```
┌─────────────────────────────────────┐
│  🎓 MathKonkur                      │
│  وارد دستیار ریاضی کنکور شوید         │
├─────────────────────────────────────┤
│  [ورود]  [ثبت نام]                  │
├─────────────────────────────────────┤
│                                     │
│  ایمیل: [input field with icon]     │
│  رمز عبور: [input field + eye icon]  │
│                                     │
│  [ورود / ایجاد حساب]               │
│                                     │
└─────────────────────────────────────┘
```

### After Login (Navbar)
```
MathKonkur  |  ویژگی‌ها  |  بانک سوالات  |  علی رضایی  [خروج]
```

## Database

Users are stored in PostgreSQL with:
- id (UUID)
- email (unique)
- passwordHash (bcrypt)
- name, level
- createdAt, lastLoginAt

## Token Details

**Access Token**
- Duration: 15 minutes
- Location: Response body → localStorage
- Usage: Sent in Authorization header

**Refresh Token**
- Duration: 7 days
- Location: HttpOnly cookie
- Usage: Browser auto-sends, server auto-refreshes access token

## Security Notes ⚠️

✅ Passwords are hashed (never stored plain)
✅ Tokens are signed (can't be forged)
✅ HttpOnly cookies (protected from XSS)
✅ CORS restricted (only from your domain)
✅ CSRF protection available
✅ Input validation on frontend & backend

## Next Features to Add

- [ ] Remember me option
- [ ] Password reset email
- [ ] Email verification
- [ ] Two-factor authentication
- [ ] OAuth login (Google, GitHub)
- [ ] Profile editing page
- [ ] User preferences/settings

---

**Everything is ready to use!** 🎉

The login/signup system is fully integrated with:
- Beautiful UI
- Complete backend
- Secure authentication
- Database persistence
- Token management
- Error handling

Just run both servers and visit http://localhost:3000
