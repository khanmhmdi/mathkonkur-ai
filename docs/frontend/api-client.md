# Frontend API Client

Axios-based HTTP client for backend communication.

## API Client Architecture

```
src/services/
├── api.ts           # Main API client
└── api.old.ts       # Legacy client (not used)
```

## Main API Client (`services/api.ts`)

**Purpose**: Standardized HTTP client with typed responses

### Axios Configuration

```typescript
import axios from 'axios';
import { api as authApi } from '../contexts/AuthContext';

const api = {
  get: <T>(url: string, config?: any) => authApi.get<ApiResponse<T>>(url, config),
  post: <T>(url: string, data?: any, config?: any) => authApi.post<ApiResponse<T>>(url, data, config),
  put: <T>(url: string, data?: any, config?: any) => authApi.put<ApiResponse<T>>(url, data, config),
  patch: <T>(url: string, data?: any, config?: any) => authApi.patch<ApiResponse<T>>(url, data, config),
  delete: <T>(url: string, config?: any) => authApi.delete<ApiResponse<T>>(url, config),
  setAccessToken: (token: string) => localStorage.setItem('accessToken', token),
  clearAccessToken: () => localStorage.removeItem('accessToken'),
  getAccessToken: () => localStorage.getItem('accessToken'),
  instance: authApi,
};
```

### Base Configuration

```typescript
// From AuthContext
const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true,  // Enable cookies
  headers: { 'Content-Type': 'application/json' }
});
```

## Response Types

### Success Response

```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
```

### Error Response

```typescript
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any[];
  };
}
```

## Error Message Localization

**File**: `src/services/api.ts`

```typescript
const errorMessages: Record<string, string> = {
  'VALIDATION_ERROR': 'اطلاعات وارد شده معتبر نیست',
  'AUTH_INVALID_CREDENTIALS': 'ایمیل یا رمز عبور اشتباه است',
  'AUTH_TOKEN_EXPIRED': 'نشست شما منقضی شده، لطفاً دوباره وارد شوید',
  'AUTH_UNAUTHORIZED': 'شما دسترسی لازم برای این عملیات را ندارید',
  'NOT_FOUND': 'مورد درخواست شده یافت نشد',
  'CONFLICT': 'این مورد قبلاً ثبت شده است',
  'AI_TIMEOUT': 'پاسخدهی هوش مصنوعی طولانی شد، لطفاً دوباره تلاش کنید',
  'INTERNAL_ERROR': 'خطای غیرمنتظره‌ای در سرور رخ داد',
};

export const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.error?.code) {
    return errorMessages[error.response.data.error.code] || error.response.data.error.message;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return 'خطای نامشخصی رخ داد';
};
```

## Usage Examples

### GET Request

```typescript
import { api } from '../services/api';

// Get questions
const response = await api.get<Question[]>('/questions', { params: { page: 1, limit: 20 } });
const questions = response.data.data;

// With pagination meta
const { data, meta } = response.data;
```

### POST Request

```typescript
// Login
const response = await api.post<{ user: User; accessToken: string }>('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});
const { user, accessToken } = response.data.data;
```

### POST with Image

```typescript
// Send chat message with image
const response = await api.post<ChatMessage>('/chat/conversation-id/message', {
  content: 'Solve this problem',
  image: {
    data: base64Image,
    mimeType: 'image/png'
  }
});
```

### Error Handling

```typescript
import { api, getErrorMessage } from '../services/api';

try {
  const response = await api.post('/auth/login', credentials);
} catch (error) {
  const message = getErrorMessage(error);
  console.error(message); // Persian error message
}
```

## Token Management

### Set Token

```typescript
api.setAccessToken('new-access-token');
```

### Get Token

```typescript
const token = api.getAccessToken();
```

### Clear Token

```typescript
api.clearAccessToken();
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout user |

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat` | Create conversation |
| POST | `/chat/:id/message` | Send message |
| GET | `/chat` | List conversations |
| GET | `/chat/:id` | Get conversation |
| DELETE | `/chat/:id` | Delete conversation |

### Questions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/questions` | List questions |
| GET | `/questions/search` | Search questions |
| GET | `/questions/:id` | Get question |
| POST | `/questions/:id/submit` | Submit answer |

### Favorites

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/favorites` | List favorites |
| POST | `/favorites` | Add favorite |
| DELETE | `/favorites/:id` | Remove favorite |
| PATCH | `/favorites/:id` | Update note |

### User

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user/me` | Get user profile |

## Related Files

| File | Purpose |
|------|---------|
| `src/services/api.ts` | API client implementation |
| `src/contexts/AuthContext.tsx` | Axios instance with interceptors |
| `backend/src/app.ts` | Backend route mounting |
| `backend/src/routes/*.routes.ts` | API route definitions |
