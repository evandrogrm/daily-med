import { Request, Response } from 'express';
import { logger } from '../logger';
import { BaseController } from './base.controller';

export class HealthCheckController extends BaseController {
  protected async execute(req: Request, res: Response): Promise<void> {
    return this.check(req, res);
  }

  public async check(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Health check endpoint called');
      this.ok(res, {
        status: 'ok',
        timestamp: new Date().toISOString(),
      }, 'Service is healthy');
    } catch (error) {
      logger.error('Health check failed', { error });
      this.fail(res, error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
