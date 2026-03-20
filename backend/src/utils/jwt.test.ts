import { describe, it, expect } from '@jest/globals';
import { generateAccessToken, verifyAccessToken, generateRefreshToken, verifyRefreshToken } from './jwt';

describe('JWT Utility', () => {
  const userPayload = {
    userId: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@test.com',
    level: 'ریاضی فیزیک'
  };

  it('should generate and verify access tokens', () => {
    const accessToken = generateAccessToken(userPayload);
    expect(accessToken.split('.')).toHaveLength(3);
    
    const decoded = verifyAccessToken(accessToken);
    expect(decoded.userId).toBe(userPayload.userId);
    expect(decoded.email).toBe(userPayload.email);
    expect(decoded.level).toBe(userPayload.level);
    expect(decoded.type).toBe('access');
    
    if (decoded.exp && decoded.iat) {
      expect(decoded.exp - decoded.iat).toBe(900);
    }
  });

  it('should generate and verify refresh tokens', () => {
    const refreshToken = generateRefreshToken({ 
      userId: userPayload.userId, 
      sessionId: 'session-123' 
    });
    const decoded = verifyRefreshToken(refreshToken);
    
    expect(decoded.type).toBe('refresh');
    expect(decoded.sessionId).toBe('session-123');
    expect(decoded.userId).toBe(userPayload.userId);
    
    if (decoded.exp && decoded.iat) {
      expect(decoded.exp - decoded.iat).toBe(604800);
    }
  });

  it('should reject tampered tokens', () => {
    const accessToken = generateAccessToken(userPayload);
    expect(() => verifyAccessToken(accessToken + 'tampered'))
      .toThrow('Invalid token');
  });

  it('should reject tokens with wrong secret', () => {
    const accessToken = generateAccessToken(userPayload);
    expect(() => verifyRefreshToken(accessToken))
      .toThrow('Invalid token');
  });
});
