import { errorMiddleware } from './error.middleware';
import { ValidationError, AuthenticationError } from '../utils/errors';

describe('Error Middleware', () => {
  let mockRes: any;
  let mockReq: any;
  const next = jest.fn();

  beforeEach(() => {
    mockRes = {
      statusCode: 0,
      body: null,
      status: jest.fn().mockImplementation(function(this: any, code: number) { 
        this.statusCode = code; 
        return this; 
      }),
      json: jest.fn().mockImplementation(function(this: any, data: any) { 
        this.body = data; 
        return this; 
      })
    };
    mockReq = { path: '/test', method: 'GET' };
    next.mockClear();
  });

  it('should handle ValidationError', () => {
    const valError = new ValidationError('Invalid input', [{ field: 'email', message: 'Wrong format' }]);
    errorMiddleware(valError, mockReq, mockRes, next);
    
    expect(mockRes.statusCode).toBe(400);
    expect(mockRes.body.error.code).toBe('ValidationError');
    expect(mockRes.body.error.details).toHaveLength(1);
  });

  it('should handle AuthenticationError', () => {
    const authError = new AuthenticationError('Invalid credentials');
    errorMiddleware(authError, mockReq, mockRes, next);
    
    expect(mockRes.statusCode).toBe(401);
    expect(mockRes.body.error.code).toBe('AuthenticationError');
  });

  it('should handle Prisma P2002 (Unique constraint) error', () => {
    const prismaUnique: any = new Error('Unique constraint');
    prismaUnique.name = 'PrismaClientKnownRequestError';
    prismaUnique.code = 'P2002';
    prismaUnique.meta = { target: ['email'] };
    
    errorMiddleware(prismaUnique, mockReq, mockRes, next);
    
    expect(mockRes.statusCode).toBe(400);
    expect(mockRes.body.error.message).toBe('Resource already exists');
  });

  it('should handle Prisma P2025 (Not Found) error', () => {
    const prismaNotFound: any = new Error('Not found');
    prismaNotFound.code = 'P2025';
    
    errorMiddleware(prismaNotFound, mockReq, mockRes, next);
    
    expect(mockRes.statusCode).toBe(404);
    expect(mockRes.body.error.code).toBe('NotFoundError');
  });

  it('should handle unknown errors as internal server errors', () => {
    const unknownError = new Error('Unexpected boom');
    errorMiddleware(unknownError, mockReq, mockRes, next);
    
    expect(mockRes.statusCode).toBe(500);
    expect(mockRes.body.error.code).toBe('INTERNAL_ERROR');
    expect(mockRes.body.error.message).toBe('Something went wrong');
  });
});
