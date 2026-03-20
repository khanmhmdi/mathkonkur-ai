import { describe, it, expect } from '@jest/globals';
import { success, error } from './api-response';

describe('API Response Formatter', () => {
  it('should format a basic success response', () => {
    const data = { id: 1, name: "Test User" };
    const res = success(data);
    
    expect(res.success).toBe(true);
    expect(res.data).toEqual(data);
    expect(typeof res.timestamp).toBe('string');
    expect(res.meta).toBeUndefined();
  });

  it('should format a success response with pagination', () => {
    const data = [{ id: 1 }, { id: 2 }];
    const pagination = { page: 1, limit: 10, total: 50 };
    const res = success(data, pagination);
    
    expect(res.meta).toBeDefined();
    expect(res.meta?.page).toBe(1);
    expect(res.meta?.limit).toBe(10);
    expect(res.meta?.total).toBe(50);
    expect(res.meta?.totalPages).toBe(5);
  });

  it('should format a basic error response', () => {
    const res = error('AUTH_INVALID_CREDENTIALS', 'ایمیل یا رمز عبور اشتباه است');
    
    expect(res.success).toBe(false);
    expect(res.error.code).toBe('AUTH_INVALID_CREDENTIALS');
    expect(res.error.message).toBe('ایمیل یا رمز عبور اشتباه است');
    expect(res.error.details).toBeUndefined();
  });

  it('should format a validation error response with details', () => {
    const details = [
      { field: 'email', message: 'فرمت ایمیل صحیح نیست', value: 'invalid-email' },
      { field: 'password', message: 'رمز عبور کوتاه است' }
    ];
    const res = error('VALIDATION_ERROR', 'ورودی نامعتبر', details);
    
    expect(res.error.details).toBeDefined();
    expect(res.error.details).toHaveLength(2);
    expect(res.error.details?.[0].field).toBe('email');
    expect(res.error.details?.[0].value).toBe('invalid-email');
  });
});
