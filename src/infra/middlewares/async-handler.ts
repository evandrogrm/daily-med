import { NextFunction, Request, RequestHandler, Response } from 'express';
import { AppError } from '../../core/errors/app-error';

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      if (!(error instanceof AppError)) {
        console.error('Unhandled async error:', error);
      }
      next(error);
    });
  };
};

export const asyncMiddleware = (middleware: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await middleware(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
