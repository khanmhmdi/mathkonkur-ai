import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

/**
 * Factory function that creates Express middleware for validating request bodies using Zod schemas.
 * 
 * @param schema The Zod schema to validate req.body against.
 * @returns Express middleware function.
 */
export const validate = (schema: ZodSchema<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Use parseAsync to support async refinements in schemas
      await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Transform Zod errors into our standardized ValidationError structure
        const details = error.errors.map(e => ({
          field: e.path.join('.'), // Convert array path to dot notation
          message: e.message,
          code: e.code
        }));
        
        return next(new ValidationError('Validation failed', details));
      }
      // If it's not a Zod error (e.g. unknown parse issue), pass it along
      return next(error);
    }
  };
};
