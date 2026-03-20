import { describe, it, expect } from '@jest/globals';
import { AppError, ValidationError, AuthenticationError, NotFoundError, ConflictError } from './errors';

describe('Error Handling System', () => {
  it('should maintain correct inheritance chain', () => {
    const valErr = new ValidationError('Test', [{ field: 'email', message: 'Invalid' }]);
    
    expect(valErr).toBeInstanceOf(ValidationError);
    expect(valErr).toBeInstanceOf(AppError);
    expect(valErr).toBeInstanceOf(Error);
  });

  it('should have correct status codes and default messages', () => {
    const authErr = new AuthenticationError();
    expect(authErr.statusCode).toBe(401);
    expect(authErr.message).toBe('Authentication required');
    
    const notFoundErr = new NotFoundError('Custom missing', 'User');
    expect(notFoundErr.statusCode).toBe(404);
    expect(notFoundErr.resource).toBe('User');

    const genericAppErr = new AppError('Server boom');
    expect(genericAppErr.statusCode).toBe(500);
    expect(genericAppErr.isOperational).toBe(true);
  });

  it('should capture correct stack trace', () => {
    function throwErrorFn() {
      throw new ConflictError();
    }
    
    try {
      throwErrorFn();
    } catch (error: any) {
      expect(error.stack).toContain('throwErrorFn');
    }
  });
});
