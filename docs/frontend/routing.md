# Frontend Routing

React Router configuration and navigation structure.

## Routing Configuration

**File**: `src/App.tsx`

```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/bank" element={<QuestionBank />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth-test" element={<AuthTestComponent />} />
    </Routes>
  );
}
```

## Route Definitions

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Landing` | Landing page with hero, features, how-it-works |
| `/bank` | `QuestionBank` | Question browsing interface |
| `/pricing` | `PricingPage` | Subscription plans and pricing |
| `/auth` | `AuthPage` | Login/signup page |
| `/auth-test` | `AuthTestComponent` | Authentication testing component |

## Navigation Flow

### Landing Page (`/`)

```
User visits /
    ↓
Landing.tsx renders
    ├─ Navbar component
    ├─ Hero section
    ├─ Features section
    ├─ How it works section
    └─ Footer
```

**Interactive Elements**:
- "شروع گفتگو با هوش مصنوعی" button → Opens ChatInterface
- "بانک سوالات" in navbar → Navigates to `/bank`
- "قیمت‌گذاری" in navbar → Navigates to `/pricing`

### Question Bank (`/bank`)

```
User navigates to /bank
    ↓
QuestionBank.tsx renders
    ├─ Filter sidebar
    ├─ Question grid
    └─ Pagination
```

**Features**:
- Filter by subject, level, topic
- Search questions
- Click "Ask AI" on question → Opens ChatInterface with pre-filled message

### Auth Page (`/auth`)

```
User navigates to /auth
    ↓
AuthPage.tsx renders
    ├─ Login tab
    └─ Register tab
```

**Flow**:
- Successful login → Redirect to returnUrl (default: `/`)
- Successful register → Redirect to returnUrl (default: `/`)
- If navigating from another page (e.g., `/pricing`), user is redirected back after auth

## Programmatic Navigation

**Using useNavigate hook**:

```typescript
import { useNavigate } from 'react-router-dom';

function Component() {
  const navigate = useNavigate();

  const handleAction = () => {
    navigate('/bank');
  };
}
```

**Navigation after auth**:

```typescript
// In AuthPage after successful login - redirects to original page
navigate(returnUrl); // returnUrl comes from location.state
```

**Navigation with returnUrl**:

```typescript
// Redirect to auth with return URL
navigate('/auth', { state: { returnUrl: '/pricing' } });
```

## Route Parameters

No dynamic route parameters currently in use.

**Future consideration**:
- `/questions/:id` - Individual question view
- `/chat/:conversationId` - Specific conversation

## Nested Routes

Not currently implemented.

**Potential structure**:
```
/bank
  /bank/subject/:subject
  /bank/topic/:topic
```

## Protected Routes

Routes requiring authentication are handled by the backend (401 response).

**Frontend handling**:
```typescript
// In AuthContext - check auth state
const isAuthenticated = !!accessToken;

// Redirect if not authenticated
if (!isAuthenticated) {
  navigate('/auth');
}
```

## 404 Handling

Not explicitly configured.

**Default behavior**: React Router shows blank page for unknown routes.

## Related Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Route definitions |
| `src/components/Landing.tsx` | Landing page with navigation |
| `src/components/QuestionBank.tsx` | Question bank with navigation |
| `src/components/AuthPage.tsx` | Auth page |
| `src/contexts/AuthContext.tsx` | Auth state for protected routes |
