import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { success } from '../utils/api-response';
import { AuthenticationError } from '../utils/errors';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/'
};

/*
# Test register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","name":"Test"}' \
  -v

# Should see Set-Cookie header with refreshToken

# Test login  
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}' \
  -c cookies.txt -v

# Test refresh with cookie
curl -X POST http://localhost:4000/api/auth/refresh \
  -b cookies.txt -v

# Test logout
curl -X POST http://localhost:4000/api/auth/logout \
  -b cookies.txt -c cookies.txt -v
*/

/**
 * Handles user registration.
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, name, level } = req.body;
    
    const result = await authService.register({ email, password, name, level });
    
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    
    res.status(201).json(success({ 
      user: result.user, 
      accessToken: result.accessToken 
    }));
  } catch (err) {
    next(err);
  }
}

/**
 * Handles user login.
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    
    const result = await authService.login(email, password);
    
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    
    res.status(200).json(success({ 
      user: result.user, 
      accessToken: result.accessToken 
    }));
  } catch (err) {
    next(err);
  }
}

/**
 * Refreshes access token using the refresh token cookie.
 */
export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken;
    
    if (!refreshToken) {
      throw new AuthenticationError('No refresh token');
    }
    
    const result = await authService.refresh(refreshToken);
    
    res.status(200).json(success({ 
      accessToken: result.accessToken 
    }));
  } catch (err) {
    next(err);
  }
}

/**
 * Handles user logout by revoking the session and clearing the cookie.
 */
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken;
    
    await authService.logout(refreshToken || '');
    
    res.clearCookie('refreshToken', { ...COOKIE_OPTIONS, maxAge: 0 });
    
    res.status(200).json(success(null));
  } catch (err) {
    next(err);
  }
}
