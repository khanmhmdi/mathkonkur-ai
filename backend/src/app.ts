import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import logger from './config/logger';
import { errorMiddleware } from './middleware/error.middleware';
import { NotFoundError } from './utils/errors';

// Routes
import authRoutes from './routes/auth.routes';
import chatRoutes from './routes/chat.routes';
import questionRoutes from './routes/question.routes';
import favoriteRoutes from './routes/favorite.routes';
import userRoutes from './routes/user.routes';

export const app = express();

/**
 * App Configuration Object
 */
// Disable 'x-powered-by' header for security
app.disable('x-powered-by');

// Trust proxy if behind reverse proxy (nginx) in production
if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

/**
 * STRICT MIDDLEWARE SETUP
 */

// 1. Security - Helmet (First)
app.use(helmet());

// 2. CORS Configuration
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Cookie Parsing
app.use(cookieParser());

// 5. Request Logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info({
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent')
  }, 'Incoming request');
  next();
});

// 6. Health Check Route (Before API routes)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  });
});

// 7. API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/user', userRoutes);


// Test routes
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working' });
});

app.post('/api/test', (req, res) => {
  res.json({ success: true, test: 'data', body: req.body });
});

// 8. 404 Not Found Handler (Before error handler)
app.use('*', (req: Request, res: Response, next: NextFunction) => {
  const err = new NotFoundError(`Cannot ${req.method} ${req.path}`);
  next(err);
});

// 9. Global Error Handler (Last)
app.use(errorMiddleware);
