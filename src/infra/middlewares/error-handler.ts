import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../core/errors/app-error';
import { ApiResponse } from '../http/response';
import { logger } from '../logger';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  if (err instanceof AppError) {
    logger.warn(`Handled error: ${err.message}`, {
      code: err.code,
      statusCode: err.statusCode,
      details: err.details,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });

    return ApiResponse.error(
      res,
      err.message,
      err.statusCode,
      err.code,
      process.env.NODE_ENV === 'development' ? err.details : undefined
    );
  }

  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    name: err.name,
  });

  return ApiResponse.error(
    res,
    'Internal server error',
    500,
    'INTERNAL_SERVER_ERROR',
    process.env.NODE_ENV === 'development' ? { message: err.message, stack: err.stack } : undefined
  );
};
