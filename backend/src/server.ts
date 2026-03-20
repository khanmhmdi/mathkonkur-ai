import { createServer } from 'http';
import { app } from './app';
import { env } from './config/env';
import logger from './config/logger';
import { prisma } from './config/database';

// 1. Validate env is loaded via import (done)

// 2. Create HTTP Server for graceful access
const server = createServer(app);

// 3. Graceful Shutdown Implementation
async function gracefulShutdown(signal: string) {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async (err) => {
    if (err) {
      logger.error(err, 'Error during HTTP server closure');
    } else {
      logger.info('HTTP server closed');
    }

    // Disconnect Prisma
    try {
      await prisma.$disconnect();
      logger.info('Database connection closed');
    } catch (dbErr) {
      logger.error(dbErr, 'Error during database disconnection');
    }

    // Exit process cleanly
    process.exit(0);
  });

  // Force shutdown if it takes too long
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

// 4. Setup exception handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  logger.error(err, 'Unhandled Promise Rejection');
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error(err, 'Uncaught Exception');
  process.exit(1);
});

// 5. Connect and Bind
async function startServer() {
  try {
    // Await database connection before serving
    await prisma.$connect();
    logger.info('Database connected');

    // Start HTTP server
    const port = env.PORT || 4000;
    
    // Explicit error trapping for Port Binding
    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${port} is already in use`);
      } else {
        logger.error(err, 'Server error');
      }
      process.exit(1);
    });

    server.listen(port, () => {
      logger.info(`Server running on port ${port} in ${env.NODE_ENV} mode`);
      logger.info(`Health check available at http://localhost:${port}/health`);
    });

  } catch (err) {
    logger.error(err, 'Failed to connect to database');
    process.exit(1);
  }
}

// Only start the server if this file is run directly (not imported via tests)
if (require.main === module) {
  startServer();
}

export { server, startServer, gracefulShutdown };
