import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { connectWithRetry, checkDatabaseConnection, gracefulShutdown, prisma } from './database';

describe('Database Configuration', () => {
  beforeAll(async () => {
    // Ensure connection is established before tests
    await connectWithRetry(2);
  });

  afterAll(async () => {
    // Cleanup connection after tests
    await gracefulShutdown();
  });

  it('connectWithRetry should succeed', async () => {
    await expect(connectWithRetry(1)).resolves.not.toThrow();
  });

  it('checkDatabaseConnection should return a healthy status', async () => {
    const health = await checkDatabaseConnection();
    expect(health.connected).toBe(true);
    expect(health.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('should execute a simple query successfully', async () => {
    // This will trigger a Prisma query
    const user = await prisma.user.findFirst();
    // We don't care if a user exists, just that the query doesn't throw
    expect(true).toBe(true); 
  });

  it('gracefulShutdown should execute without errors', async () => {
    await expect(gracefulShutdown()).resolves.not.toThrow();
  });
});
