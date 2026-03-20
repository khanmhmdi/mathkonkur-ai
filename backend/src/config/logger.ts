import pino from 'pino';

/**
 * Usage Examples:
 * // Simple message:
 * logger.info('Server started on port 4000');
 *
 * // With context:
 * logger.debug({ query: 'SELECT * FROM users' }, 'Database query');
 *
 * // Error:
 * try {
 *   await riskyOperation();
 * } catch (err) {
 *   logger.error(err, 'Risky operation failed');
 * }
 *
 * // Child logger in request handler:
 * const reqLogger = createChildLogger({ requestId: uuid(), userId: user.id });
 * reqLogger.info('Request processed');
 */

const config = {
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info'),
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname'
    }
  } : undefined,
  redact: {
    paths: [
      'req.headers.authorization', 
      'req.headers.cookie', 
      'password', 
      'passwordHash', 
      'token', 
      'refreshToken', 
      'req.body.password', 
      'req.body.token',
      '*.password',
      '*.passwordHash',
      '*.token'
    ],
    censor: '[REDACTED]'
  },
  base: {
    pid: process.env.NODE_ENV !== 'production' ? undefined : process.pid,
    env: process.env.NODE_ENV
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`
};

const logger = pino(config);

export default logger;

export function createChildLogger(bindings: { [key: string]: string }) {
  return logger.child(bindings);
}

// Request Logger Middleware Helper
export function requestLogger(req: any, res: any, next: any) {
  const requestId = Math.random().toString(36).substring(2);
  const reqLog = createChildLogger({ requestId });
  
  req.log = reqLog;

  reqLog.info({
    method: req.method,
    path: req.path,
    query: req.query
  }, 'Request start');

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    reqLog.info({
      statusCode: res.statusCode,
      duration: `${duration}ms`
    }, 'Request completed');
  });

  next();
}
