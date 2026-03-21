import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getUserProfile } from '../controllers/user.controller';

const router = Router();

/**
 * GET /api/user/me - Get current user profile
 */
router.get('/me', authenticate, getUserProfile);

export default router;
