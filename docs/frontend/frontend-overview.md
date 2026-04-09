# Frontend Overview

The MathKonkur AI frontend is a React 19 application built with Vite, providing the user interface for the math tutoring platform.

## Key Directories

```
src/
├── main.tsx              # Application entry point
├── App.tsx               # Main app component with routing
├── index.css             # Global styles (Tailwind CSS)
├── components/           # React UI components
├── contexts/             # React Context providers
├── services/             # API client services
├── data/                 # Static data
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## Important Files

| File | Purpose |
|------|---------|
| `main.tsx` | React app initialization with providers |
| `App.tsx` | Main component with routing and layout |
| `index.css` | Tailwind CSS imports and global styles |
| `services/api.ts` | Axios-based API client |
| `contexts/AuthContext.tsx` | Authentication state management |

## Internal Architecture

### Component Hierarchy

```
App.tsx
├── ErrorBoundary.tsx
├── Router
│   ├── AppContent()
│   │   ├── Navbar (from Landing.tsx)
│   │   ├── Routes
│   │   │   ├── Route: / (Landing page)
│   │   │   ├── Route: /bank (QuestionBank)
│   │   │   ├── Route: /auth (AuthPage)
│   │   │   └── Route: /auth-test (AuthTestComponent)
│   │   ├── Footer
│   │   └── AnimatePresence
│   │       └── ChatInterface (overlay)
```

### State Management

| Context | Purpose | State |
|---------|---------|-------|
| `AuthContext` | Authentication | user, accessToken, isAuthenticated, login, logout |

### Service Layer

```
services/
└── api.ts
    └── Uses AuthContext's axios instance
```

## Key Components

### AuthPage (`components/AuthPage.tsx`)

**Purpose**: Login and registration UI

**Features**:
- Tab switching between login/signup
- Form validation
- Error display
- Persian localization

**Props**: None (standalone page)

### ChatInterface (`components/ChatInterface.tsx`)

**Purpose**: AI chat interface for math tutoring

**Features**:
- Message history display
- Input field with submit
- LaTeX rendering (via react-markdown + rehype-katex)
- Image upload support
- Typing indicator
- **Chat History Sidebar** - View, select, and delete previous conversations
- **New Chat** - Start fresh conversations
- Mobile-responsive sidebar with toggle

**Props**:
```typescript
interface ChatInterfaceProps {
  onClose: () => void;
  initialMessage?: string | null;
}
```

**Related Services**:
- `chatHistoryService.ts` - API service for chat history operations

**See Also**:
- [Chat History Feature](./chat-history.md) - Detailed documentation

### QuestionBank (`components/QuestionBank.tsx`)

**Purpose**: Question browsing and filtering

**Features**:
- Filter by subject, level, topic
- Pagination
- Question cards with AI ask button
- Answer display with explanation

**Props**:
```typescript
interface QuestionBankProps {
  onClose: () => void;
  onAskAI: (question: Question) => void;
}
```

### Landing (`components/Landing.tsx`)

**Purpose**: Landing page with Navbar and Hero section

**Features**:
- Responsive navbar
- Hero section with CTA
- Features section
- How it works section

**Exports**: `Navbar`, `Hero` components

### ErrorBoundary (`components/ErrorBoundary.tsx`)

**Purpose**: React error boundary for graceful error handling

**Features**:
- Catches React errors
- Displays error UI
- Allows recovery

## Routing

**File**: `src/App.tsx`

```typescript
<Routes>
  <Route path="/" element={<Landing />} />
  <Route path="/bank" element={<QuestionBank />} />
  <Route path="/auth" element={<AuthPage />} />
  <Route path="/auth-test" element={<AuthTestComponent />} />
</Routes>
```

## State Management

### AuthContext (`contexts/AuthContext.tsx`)

**Purpose**: Centralized authentication state

**State**:
```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}
```

**Methods**:
- `login(email, password)` - Authenticate user
- `register(email, password, name, level)` - Create account
- `logout()` - Clear auth state
- `refresh()` - Refresh access token
- `updateUser(user)` - Update user data

**Implementation**:
- Uses Axios instance with interceptors
- Stores access token in localStorage
- Handles HttpOnly refresh cookie automatically
- Attaches Bearer token to requests

## API Client

**File**: `src/services/api.ts`

**Purpose**: Standardized API client wrapper

**Features**:
- Typed API responses
- Error message localization
- Token management utilities

**Response Types**:
```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: { page, limit, total, totalPages };
}

interface ApiError {
  success: false;
  error: { code, message, details? };
}
```

**Exported Methods**:
```typescript
export const api = {
  get: <T>(url, config?) => authApi.get<ApiResponse<T>>(url, config),
  post: <T>(url, data?, config?) => authApi.post<ApiResponse<T>>(url, data, config),
  put: <T>(url, data?, config?) => authApi.put<ApiResponse<T>>(url, data, config),
  patch: <T>(url, data?, config?) => authApi.patch<ApiResponse<T>>(url, data, config),
  delete: <T>(url, config?) => authApi.delete<ApiResponse<T>>(url, config),
  setAccessToken: (token: string) => localStorage.setItem('accessToken', token),
  clearAccessToken: () => localStorage.removeItem('accessToken'),
  getAccessToken: () => localStorage.getItem('accessToken'),
};
```

## Styling

**Framework**: Tailwind CSS 4

**Configuration**: `vite.config.ts` with `@tailwindcss/vite`

**Classes**:
- `dir="rtl"` for Persian text direction
- Responsive design (mobile-first)
- Custom color palette (indigo, slate)

**Example**:
```tsx
<div className="min-h-screen bg-white font-sans text-slate-900" dir="rtl">
```

## Dependencies

### Main Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19.0.0 | UI framework |
| `react-dom` | ^19.0.0 | DOM rendering |
| `react-router-dom` | ^7.13.1 | Routing |
| `axios` | ^1.13.6 | HTTP client |
| `tailwindcss` | ^4.1.14 | Styling |
| `lucide-react` | ^0.546.0 | Icons |
| `motion` | ^12.23.24 | Animations |
| `katex` | ^0.16.11 | LaTeX rendering |
| `react-markdown` | ^10.1.0 | Markdown rendering |
| `rehype-katex` | ^7.0.0 | LaTeX plugin for Markdown |
| `remark-math` | ^6.0.0 | Math plugin for Markdown |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | ^6.2.0 | Build tool |
| `typescript` | ~5.8.2 | TypeScript |
| `jest` | ^30.3.0 | Testing |
| `@testing-library/react` | ^16.3.2 | React testing |

## Build Configuration

**File**: `vite.config.ts`

```typescript
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.VITE_GAPGPT_API_KEY': JSON.stringify(env.VITE_GAPGPT_API_KEY),
    },
    resolve: {
      alias: { '@': path.resolve(__dirname, '.') },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run lint

# Run tests
npm run test

# Run E2E tests (Playwright)
npm run test:e2e        # Run all E2E tests
npm run test:e2e:ui     # Run with UI mode
npm run test:e2e:headed # Run in headed mode
```

## Related Documentation

- Routing: `docs/frontend/routing.md`
- State management: `docs/frontend/state-management.md`
- API client: `docs/frontend/api-client.md`
- UI architecture: `docs/frontend/ui-architecture.md`
