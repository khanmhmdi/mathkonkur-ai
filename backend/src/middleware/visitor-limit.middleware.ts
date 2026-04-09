import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { prisma } from '../config/database';
import logger from '../config/logger';

const VISITOR_PROMPT_LIMIT = 2;
const VISITOR_COOKIE_NAME = 'visitorId';

declare global {
  namespace Express {
    interface Request {
      isVisitor?: boolean;
      visitorPromptCount?: number;
      visitorId?: string;
    }
  }
}

export function visitorPromptLimit(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.isVisitor = true;
    trackVisitorPrompt(req, res, next);
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    req.isVisitor = true;
    trackVisitorPrompt(req, res, next);
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    req.isVisitor = false;
    next();
  } catch (err) {
    req.isVisitor = true;
    trackVisitorPrompt(req, res, next);
  }
}

async function trackVisitorPrompt(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let visitorId = req.cookies?.[VISITOR_COOKIE_NAME];
    
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      res.cookie(VISITOR_COOKIE_NAME, visitorId, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: 'lax'
      });
    }
    
    req.visitorId = visitorId;
    
    // Ensure visitor user exists in database
    await prisma.user.upsert({
      where: { id: visitorId },
      update: {},
      create: {
        id: visitorId,
        email: `${visitorId}@visitor.local`,
        passwordHash: 'visitor_no_login',
        promptCount: 0
      }
    });

    const visitor = await prisma.user.findUnique({
      where: { id: visitorId },
      select: { promptCount: true }
    });

    const currentCount = visitor?.promptCount || 0;
    req.visitorPromptCount = currentCount;

    logger.info({ visitorId, currentCount, limit: VISITOR_PROMPT_LIMIT }, 'Visitor prompt check');

    if (currentCount >= VISITOR_PROMPT_LIMIT) {
      const error = new Error('شما به محدودیت ۲ پیام برای کاربران مهمان رسیده‌اید. لطفاً برای ادامه وارد حساب کاربری خود شوید.');
      (error as any).statusCode = 429;
      (error as any).code = 'VISITOR_PROMPT_LIMIT_EXCEEDED';
      return next(error);
    }

    next();
  } catch (err) {
    logger.error({ err }, 'Error in trackVisitorPrompt');
    next(err);
  }
}

export async function incrementVisitorPrompt(visitorId: string): Promise<void> {
  await prisma.user.upsert({
    where: { id: visitorId },
    update: { promptCount: { increment: 1 } },
    create: { 
      id: visitorId,
      email: `${visitorId}@visitor.local`,
      passwordHash: 'visitor_no_login',
      promptCount: 1
    }
  });
}
