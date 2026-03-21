import { api as authApi } from '../contexts/AuthContext';

/**
 * Standard API Error Response format from backend
 */
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any[];
  };
}

/**
 * Standard API Success Response format
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * Persian error message localizer mapping
 */
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

/**
 * Axios Instance Configuration
 */
const API_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) 
  || 'http://localhost:4000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Critical for HttpOnly refresh cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/**
 * Token Refresh Queue Logic
 * Handles multiple concurrent 401s by queuing them until one successful refresh.
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Request Interceptor: Attach Access Token
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Skip auth header if requested (e.g. for refresh heartbeat)
    if ((config as any)._skipAuth) return config;

    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor: Global Error Handling & Token Refresh
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 1. Handle 401 Unauthorized (Token Expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request until refresh finishes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh via HttpOnly cookie
        const refreshRes = await axios.post<{ data: { accessToken: string } }>(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = refreshRes.data.data;
        localStorage.setItem('accessToken', accessToken);

        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        // Optional: window.dispatchEvent(new Event('auth:logout')); 
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 2. Localization & Normalization
    const backendError = error.response?.data as ApiError | undefined;
    const code = backendError?.error?.code || 'INTERNAL_ERROR';
    const message = errorMessages[code] || backendError?.error?.message || 'خطایی رخ داد';

    const enhancedError = {
      message,
      code,
      status: error.response?.status,
      details: backendError?.error?.details,
      originalError: error,
    };

    return Promise.reject(enhancedError);
  }
);

/**
 * Exported API Methods
 */
export const api = {
  get: <T>(url: string, config?: any) => axiosInstance.get<ApiResponse<T>>(url, config),
  post: <T>(url: string, data?: any, config?: any) => axiosInstance.post<ApiResponse<T>>(url, data, config),
  put: <T>(url: string, data?: any, config?: any) => axiosInstance.put<ApiResponse<T>>(url, data, config),
  patch: <T>(url: string, data?: any, config?: any) => axiosInstance.patch<ApiResponse<T>>(url, data, config),
  delete: <T>(url: string, config?: any) => axiosInstance.delete<ApiResponse<T>>(url, config),

  // Token Management (Stateless)
  setAccessToken: (token: string) => localStorage.setItem('accessToken', token),
  clearAccessToken: () => localStorage.removeItem('accessToken'),
  getAccessToken: () => localStorage.getItem('accessToken'),
  
  // Instance access
  instance: axiosInstance,
};

export default api;
