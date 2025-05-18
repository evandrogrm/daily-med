import { Request, Response } from 'express';
import { ApiResponse } from '../http/response';
import { logger } from '../logger';

export abstract class BaseController {
  protected abstract execute(req: Request, res: Response): Promise<void>;

  public async executeRequest(req: Request, res: Response): Promise<void> {
    try {
      await this.execute(req, res);
    } catch (error) {
      logger.error('Controller error:', error);
      this.fail(res, 'An unexpected error occurred');
    }
  }

  protected ok<T>(res: Response, dto?: T, message?: string): Response {
    return ApiResponse.success(res, dto, message);
  }

  protected created<T>(res: Response, dto?: T, message?: string): Response {
    return ApiResponse.success(res, dto, message, 201);
  }

  protected noContent(res: Response): Response {
    return res.status(204).send();
  }

  protected badRequest(res: Response, message?: string, details?: unknown): Response {
    return ApiResponse.badRequest(res, message, details);
  }

  protected unauthorized(res: Response, message?: string): Response {
    return ApiResponse.unauthorized(res, message);
  }

  protected forbidden(res: Response, message?: string): Response {
    return ApiResponse.forbidden(res, message);
  }

  protected notFound(res: Response, message?: string): Response {
    return ApiResponse.notFound(res, message);
  }

  protected conflict(res: Response, message?: string): Response {
    return ApiResponse.conflict(res, message);
  }

  protected fail(res: Response, error: Error | string): Response {
    const message = error instanceof Error ? error.message : error;
    return ApiResponse.error(res, message, 500, 'INTERNAL_SERVER_ERROR');
  }
}
