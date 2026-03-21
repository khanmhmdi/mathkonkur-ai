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
 * Get localized error message
 */
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

/**
 * Exported API Methods using auth context's axios instance
 */
export const api = {
  get: <T>(url: string, config?: any) => authApi.get<ApiResponse<T>>(url, config),
  post: <T>(url: string, data?: any, config?: any) => authApi.post<ApiResponse<T>>(url, data, config),
  put: <T>(url: string, data?: any, config?: any) => authApi.put<ApiResponse<T>>(url, data, config),
  patch: <T>(url: string, data?: any, config?: any) => authApi.patch<ApiResponse<T>>(url, data, config),
  delete: <T>(url: string, config?: any) => authApi.delete<ApiResponse<T>>(url, config),

  // Token Management (Stateless)
  setAccessToken: (token: string) => localStorage.setItem('accessToken', token),
  clearAccessToken: () => localStorage.removeItem('accessToken'),
  getAccessToken: () => localStorage.getItem('accessToken'),
  
  // Instance access
  instance: authApi,
};

export default api;
