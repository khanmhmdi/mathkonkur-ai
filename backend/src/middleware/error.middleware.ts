import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../config/logger';

/**
 * Global error handling middleware for Express.
 * Catches all errors and formats appropriate HTTP responses.
 */
export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let statusCode = 500;
  let response = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong',
      details: undefined as any
    }
  };

  // 0. Handle Express/Middleware errors that have a status code (e.g. bodyParser 413)
  const errStatus = err.status || err.statusCode;
  if (errStatus) {
    statusCode = errStatus;
    response.error.code = err.name || 'Error';
    response.error.message = err.message;
  }

  // 1. Check if error is an instance of AppError (Operational Error)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    response.error.code = err.name;
    response.error.message = err.message;
    
    if ((err as any).details) {
      response.error.details = (err as any).details;
    }

    // Log at appropriate level
    if (statusCode >= 500) {
      logger.error(err);
    } else {
      logger.warn({
        name: err.name,
        message: err.message,
        path: req.path,
        method: req.method
      });
    }
  } 
  // 2. Special handling for Prisma errors
  else if (err.name === 'PrismaClientKnownRequestError' || err.code?.startsWith('P2')) {
    response.error.code = 'ValidationError'; // Map most DB issues to validation logic
    statusCode = 400;

    if (err.code === 'P2002') {
      response.error.message = 'Resource already exists';
      const target = err.meta?.target;
      if (Array.isArray(target)) {
        response.error.details = [{ field: target[0], message: 'Must be unique' }];
      }
    } else if (err.code === 'P2025') {
      statusCode = 404;
      response.error.code = 'NotFoundError';
      response.error.message = 'Record not found';
    } else {
      response.error.message = 'Database error';
      logger.error(err, 'Uncaught Prisma Error');
    }
  }
  // 3. Unknown/Programming Errors
  else {
    logger.error(err);
    // Response stays at default 500 / INTERNAL_ERROR
  }

  // Set response and send
  res.status(statusCode).json(response);
}
