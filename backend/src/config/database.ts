import { PrismaClient } from '@prisma/client';

// Singleton setup
const globalForPrisma = globalThis as unknown as { prisma: any | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  ...(process.env.NODE_ENV === 'development' && {
    log: [
      {
        emit: 'event',
        level: 'query',
      },
    ],
  }),
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Development logging setup
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e: any) => {
    console.log(`[PRISMA] Query: ${e.query} | Duration: ${e.duration}ms`);
  });
}

// Retry connection function
export async function connectWithRetry(maxRetries = 3): Promise<void> {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      await prisma.$connect();
      return;
    } catch (error: any) {
      retries++;
      console.log(`Database connection attempt ${retries}/${maxRetries} failed, retrying...`);
      if (retries >= maxRetries) {
        throw new Error(`Unable to connect to database after ${maxRetries} attempts`);
      }
      // wait with exponential backoff: 1s, 2s, 4s
      const backoffSecs = Math.pow(2, retries - 1);
      await new Promise((resolve) => setTimeout(resolve, backoffSecs * 1000));
    }
  }
}

// Graceful shutdown function
export async function gracefulShutdown(): Promise<void> {
  await prisma.$disconnect();
  console.log('Database connection closed gracefully');
}

// Health check function
export async function checkDatabaseConnection(): Promise<{ connected: boolean; latencyMs: number }> {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1 as test`;
    const latencyMs = Date.now() - start;
    return { connected: true, latencyMs };
  } catch (error) {
    return { connected: false, latencyMs: 0 };
  }
}

// Type exports
export { User, Session, ChatConversation, ChatMessage, Prisma } from '@prisma/client';
