import { Request, Response, NextFunction } from 'express';
import { success } from '../utils/api-response';
import { AuthenticationError } from '../utils/errors';

/**
 * GET /api/user/me
 * Returns the current authenticated user's profile information.
 */
export async function getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as any).user;
    
    if (!user) {
      throw new AuthenticationError('User not authenticated');
    }

    res.json(success({ user }));
  } catch (err) {
    next(err);
  }
}
