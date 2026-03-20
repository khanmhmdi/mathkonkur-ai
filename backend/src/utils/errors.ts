export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Maintain proper stack trace (only available on V8 Engine)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends AppError {
  public readonly details?: Array<{field: string, message: string, code?: string}>;

  constructor(message: string, details?: Array<{field: string, message: string, code?: string}>) {
    super(message, 400, true);
    this.name = this.constructor.name;
    this.details = details;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, true);
    this.name = this.constructor.name;
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Permission denied") {
    super(message, 403, true);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends AppError {
  public readonly resource?: string;

  constructor(message: string = "Resource not found", resource?: string) {
    super(message, 404, true);
    this.name = this.constructor.name;
    this.resource = resource;
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(message, 409, true);
    this.name = this.constructor.name;
  }
}

export type AppErrorType = AppError | ValidationError | AuthenticationError | AuthorizationError | NotFoundError | ConflictError;
