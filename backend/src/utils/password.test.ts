import { describe, it, expect } from '@jest/globals';
import { hashPassword, comparePassword } from './password';

describe('Password Hashing Utility', () => {
  const testPassword = 'myPassword123';

  it('should generate hashes with correct format', async () => {
    const hash = await hashPassword(testPassword);
    expect(hash.startsWith('$2b$12$')).toBe(true);
  });

  it('should validate correct passwords', async () => {
    const hash = await hashPassword(testPassword);
    const isValid = await comparePassword(testPassword, hash);
    expect(isValid).toBe(true);
  });

  it('should reject wrong passwords', async () => {
    const hash = await hashPassword(testPassword);
    const isInvalid = await comparePassword('wrongpassword', hash);
    expect(isInvalid).toBe(false);
  });

  it('should handle whitespace by trimming and validating', async () => {
    const hash = await hashPassword(testPassword);
    const isValid = await comparePassword('  ' + testPassword + '  ', hash);
    expect(isValid).toBe(true);
  });

  it('should handle empty values', async () => {
    const emptyHash = await hashPassword('');
    const isValid = await comparePassword('', emptyHash);
    expect(isValid).toBe(true);
  });
});
