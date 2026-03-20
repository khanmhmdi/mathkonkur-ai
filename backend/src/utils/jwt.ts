import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthenticationError } from './errors';

export interface AccessTokenPayload {
  userId: string;
  email: string;
  level: string;
  type: 'access';
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
  type: 'refresh';
  iat?: number;
  exp?: number;
}

/**
 * Generates an access token valid for 15 minutes.
 */
export function generateAccessToken(payload: Omit<AccessTokenPayload, 'type' | 'iat' | 'exp'>): string {
  return jwt.sign(
    { ...payload, type: 'access' },
    env.JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: '15m' // 900 seconds
    }
  );
}

/**
 * Generates a refresh token valid for 7 days.
 */
export function generateRefreshToken(payload: Omit<RefreshTokenPayload, 'type' | 'iat' | 'exp'>): string {
  return jwt.sign(
    { ...payload, type: 'refresh' },
    env.JWT_REFRESH_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: '7d' // 604800 seconds
    }
  );
}

/**
 * Verifies an access token and returns its decoded payload.
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'],
      clockTolerance: 0
    }) as AccessTokenPayload;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Token expired');
    }
    throw new AuthenticationError('Invalid token');
  }
}

/**
 * Verifies a refresh token and returns its decoded payload.
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET, {
      algorithms: ['HS256'],
      clockTolerance: 0
    }) as RefreshTokenPayload;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Token expired');
    }
    throw new AuthenticationError('Invalid token');
  }
}
