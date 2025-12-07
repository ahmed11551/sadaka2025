import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { log } from '../index';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    const validationError = fromZodError(err);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: validationError.details,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  log(`Unhandled error: ${err.message}`, 'error');
  console.error(err.stack);

  return res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
