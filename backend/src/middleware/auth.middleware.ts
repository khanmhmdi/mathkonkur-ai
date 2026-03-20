import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AuthenticationError } from '../utils/errors';

/**
 * Extend Express Request type to include the authenticated user.
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        level: string;
        type: 'access';
      };
    }
  }
}

/**
 * Middleware to strictly enforce authentication using a Bearer JWT access token.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AuthenticationError('Authorization header required'));
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return next(new AuthenticationError('Token not provided'));
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware that optionally identifies a user if a valid Bearer token is present, 
 * but otherwise allows the request to proceed without authentication.
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    // Gracefully ignore errors and proceed without attaching req.user
    next();
  }
}
