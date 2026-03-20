import { z } from 'zod';
import { validate } from './validate.middleware';
import { ValidationError } from '../utils/errors';

describe('Validation Middleware', () => {
  const testSchema = z.object({
    email: z.string().email(),
    age: z.number().min(18)
  });

  const middleware = validate(testSchema);

  it('should call next() for valid input', async () => {
    const mockReq = { body: { email: 'test@test.com', age: 25 } } as any;
    const mockRes = {} as any;
    const next = jest.fn();

    await middleware(mockReq, mockRes, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('should throw ValidationError for invalid email format', async () => {
    const mockReq = { body: { email: 'invalid-email', age: 25 } } as any;
    const mockRes = {} as any;
    const next = jest.fn();

    await middleware(mockReq, mockRes, next);
    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    const error = next.mock.calls[0][0] as ValidationError;
    expect(error.details?.some((d: any) => d.field === 'email' && d.code === 'invalid_string')).toBe(true);
  });

  it('should throw ValidationError for missing field', async () => {
    const mockReq = { body: { email: 'test@test.com' } } as any;
    const mockRes = {} as any;
    const next = jest.fn();

    await middleware(mockReq, mockRes, next);
    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    const error = next.mock.calls[0][0] as ValidationError;
    expect(error.details!.some(d => d.field === 'age' && d.code === 'invalid_type')).toBe(true);
  });

  it('should throw ValidationError for type mismatch', async () => {
    const mockReq = { body: { email: 'test@test.com', age: 'twenty' } } as any;
    const mockRes = {} as any;
    const next = jest.fn();

    await middleware(mockReq, mockRes, next);
    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    const error = next.mock.calls[0][0] as ValidationError;
    expect(error.details!.some(d => d.field === 'age' && d.code === 'invalid_type')).toBe(true);
  });
});
