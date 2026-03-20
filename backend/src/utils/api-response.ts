/**
 * Error Code Conventions:
 * Must follow pattern CATEGORY_SPECIFIC_ERROR:
 * - AUTH_INVALID_CREDENTIALS
 * - AUTH_TOKEN_EXPIRED
 * - AUTH_TOKEN_INVALID
 * - VALIDATION_ERROR
 * - VALIDATION_REQUIRED_FIELD
 * - RESOURCE_NOT_FOUND
 * - RESOURCE_ALREADY_EXISTS
 * - PERMISSION_DENIED
 * - INTERNAL_SERVER_ERROR
 * 
 * Usage Examples:
 * // In controller - success:
 * res.json(success({ user: { id: 1, name: 'Ali' } }));
 *
 * // In controller - success with pagination:
 * res.json(success(questions, { page: 1, limit: 20, total: 150 }));
 *
 * // In controller - error:
 * res.status(400).json(error('VALIDATION_ERROR', 'ایمیل نامعتبر است'));
 *
 * // In error middleware:
 * res.status(err.statusCode).json(error('INTERNAL_SERVER_ERROR', err.message));
 */

export interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
  };
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{
      field?: string;
      message: string;
      value?: any;
    }>;
  };
  timestamp: string;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export function success<T>(data: T, meta?: { page: number; limit: number; total: number }): SuccessResponse<T> {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };

  if (meta) {
    response.meta = {
      ...meta,
      totalPages: Math.ceil(meta.total / meta.limit)
    };
  }

  return response;
}

export function error(
  code: string,
  message: string,
  details?: Array<{ field?: string; message: string; value?: any }>
): ErrorResponse {
  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
    },
    timestamp: new Date().toISOString()
  };

  if (details) {
    response.error.details = details;
  }

  return response;
}
