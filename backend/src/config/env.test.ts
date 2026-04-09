import { describe, it, expect } from '@jest/globals';
import { env } from './env';

describe('Environment Configuration', () => {
  it('should have all required environment variables', () => {
    expect(env.NODE_ENV).toBeDefined();
    expect(env.PORT).toBeDefined();
    expect(env.DATABASE_URL).toBeDefined();
    expect(env.JWT_SECRET).toBeDefined();
    expect(env.GAPGPT_API_KEY).toBeDefined();
  });

  it('should have a valid DATABASE_URL', () => {
    expect(env.DATABASE_URL.startsWith('postgresql://') || env.DATABASE_URL.startsWith('postgres://')).toBe(true);
  });
});
