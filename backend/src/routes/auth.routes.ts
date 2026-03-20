import { Router } from 'express';
import { register, login, refresh, logout } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

/**
 * Zod schemas for request validation.
 */
const registerSchema = z.object({
  email: z.string().email('ایمیل نامعتبر است'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
  name: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد').optional(),
  level: z.enum(['ریاضی فیزیک', 'علوم تجربی', 'انسانی و معارف']).optional()
});

const loginSchema = z.object({
  email: z.string().email('ایمیل نامعتبر است'),
  password: z.string().min(1, 'رمز عبور الزامی است')
});

/**
 * Route Definitions
 */

// POST /api/auth/register
router.post('/register', validate(registerSchema), register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// POST /api/auth/refresh
router.post('/refresh', refresh);

// POST /api/auth/logout
router.post('/logout', logout);

/**
 * Mounting Instruction:
 * 
 * In backend/src/app.ts or backend/src/routes/index.ts:
 * 
 * import authRoutes from './auth.routes';
 * app.use('/api/auth', authRoutes);
 * 
 * This creates:
 * POST /api/auth/register
 * POST /api/auth/login
 * POST /api/auth/refresh
 * POST /api/auth/logout
 */

export default router;
