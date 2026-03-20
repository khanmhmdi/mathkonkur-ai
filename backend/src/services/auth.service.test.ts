import { describe, it, expect } from '@jest/globals';
import { register, login, refresh, logout } from './auth.service';

describe('Auth Service', () => {
  const testEmail = 'auth.' + Date.now() + '@test.com';
  const password = 'securePass123';
  let refreshToken: string;

  it('should register a new user', async () => {
    const result = await register({
      email: testEmail,
      password,
      name: 'Auth Test',
      level: 'ریاضی فیزیک'
    });
    
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.email).toBe(testEmail.toLowerCase());
    expect((result.user as any).passwordHash).toBeUndefined();
    
    refreshToken = result.refreshToken;
  });

  it('should reject duplicate registration', async () => {
    await expect(register({ email: testEmail, password }))
      .rejects.toThrow('Email already registered');
  });

  it('should login successfully', async () => {
    const result = await login(testEmail, password);
    expect(result.accessToken).toBeDefined();
    expect(result.user.lastLoginAt).not.toBeNull();
    
    refreshToken = result.refreshToken;
  });

  it('should reject login with wrong password', async () => {
    await expect(login(testEmail, 'wrongpass'))
      .rejects.toThrow('Invalid credentials');
  });

  it('should reject login for non-existent user', async () => {
    await expect(login('nonexistent@test.com', password))
      .rejects.toThrow('Invalid credentials');
  });

  it('should refresh access token', async () => {
    const result = await refresh(refreshToken);
    expect(result.accessToken).toBeDefined();
  });

  it('should logout and revoke token', async () => {
    await logout(refreshToken);
    await expect(refresh(refreshToken))
      .rejects.toThrow('Session expired');
  });
});
