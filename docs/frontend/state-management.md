# Frontend State Management

React Context-based state management for authentication and application state.

## State Management Architecture

```
src/contexts/
└── AuthContext.tsx    # Authentication state
```

## AuthContext (`contexts/AuthContext.tsx`)

**Purpose**: Centralized authentication state management

### State Structure

```typescript
interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateUser: (user: User) => void;
}
```

### State Variables

| Variable | Type | Description |
|----------|------|-------------|
| `user` | `User \| null` | Current user data |
| `accessToken` | `string \| null` | JWT access token |
| `isAuthenticated` | `boolean` | Auth state flag |

### Axios Instance Configuration

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true,  // Include cookies
  headers: { 'Content-Type': 'application/json' }
});
```

### Request Interceptor

```typescript
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

### Response Interceptor

```typescript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      try {
        await refresh();
        return api(error.config);
      } catch {
        logout();
        navigate('/auth');
      }
    }
    return Promise.reject(error);
  }
);
```

## Authentication Methods

### `login(email, password)`

**Implementation**:
```typescript
const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  const { user, accessToken } = response.data.data;
  
  setUser(user);
  setAccessToken(accessToken);
  localStorage.setItem('accessToken', accessToken);
};
```

**Flow**:
1. POST to `/api/auth/login`
2. Extract user and accessToken from response
3. Set HttpOnly refresh cookie by browser
4. Store accessToken in localStorage
5. Update state

### `register(data)`

**Implementation**:
```typescript
const register = async (data: RegisterData) => {
  const response = await api.post('/auth/register', data);
  const { user, accessToken } = response.data.data;
  
  setUser(user);
  setAccessToken(accessToken);
  localStorage.setItem('accessToken', accessToken);
};
```

**Register Data**:
```typescript
interface RegisterData {
  email: string;
  password: string;
  name?: string;
  level?: string;
}
```

### `logout()`

**Implementation**:
```typescript
const logout = async () => {
  await api.post('/auth/logout');
  setUser(null);
  setAccessToken(null);
  localStorage.removeItem('accessToken');
};
```

**Flow**:
1. POST to `/api/auth/logout` (invalidates session)
2. Clear localStorage
3. Update state to null

### `refresh()`

**Implementation**:
```typescript
const refresh = async () => {
  const response = await api.post('/auth/refresh');
  const { accessToken } = response.data.data;
  
  setAccessToken(accessToken);
  localStorage.setItem('accessToken', accessToken);
};
```

**Flow**:
1. POST to `/api/auth/refresh` (sends HttpOnly cookie)
2. Receive new accessToken
3. Update localStorage and state

## Local Storage

**Key**: `accessToken`

**Usage**:
```typescript
// Get token
const token = localStorage.getItem('accessToken');

// Set token
localStorage.setItem('accessToken', token);

// Remove token
localStorage.removeItem('accessToken');
```

## Context Usage

### Provider Setup

```typescript
import { createContext, useContext, useState, useEffect } from 'react';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  // Initialize from localStorage
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAccessToken(token);
      // Optionally fetch user profile
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, isAuthenticated: !!accessToken, ...methods }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Consuming Context

```typescript
import { useAuth } from './contexts/AuthContext';

function Component() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <Login />;
  }
  
  return <Dashboard user={user} />;
}
```

## State Persistence

| State | Storage | Method |
|-------|---------|--------|
| `accessToken` | localStorage | Manual read/write |
| `user` | Memory | State only |
| `refreshToken` | HttpOnly cookie | Browser automatic |

## Related Files

| File | Purpose |
|------|---------|
| `src/contexts/AuthContext.tsx` | Auth context implementation |
| `src/services/api.ts` | API client wrapper |
| `src/components/AuthPage.tsx` | Login/register UI |
| `backend/src/middleware/auth.middleware.ts` | Backend auth verification |
