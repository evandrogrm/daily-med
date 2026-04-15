import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'reflect-metadata';
import { config } from './config';
import { mongoDBConnection } from './database/mongodb';
import { logger } from './logger';
import { errorHandler } from './middlewares/error-handler';
import { setupRoutes } from './routes';

class App {
  public express: Application;

  constructor() {
    this.express = express();
    this.middlewares();
    this.routes();
    this.errorHandler();
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await mongoDBConnection.connect();
      logger.info('Database connection established');
    } catch (error) {
      logger.error('Failed to connect to the database', { error });
      process.exit(1);
    }
  }

  private middlewares(): void {
    this.express.use(helmet());

    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : [];
    this.express.use(
      cors({
        origin: allowedOrigins.length > 0 ? allowedOrigins : false,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      }),
    );

    this.express.use(express.json({ limit: '1mb' }));

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: { status: 'error', message: 'Too many requests, please try again later.' },
    });
    this.express.use(limiter);
  }

  private routes(): void {
    setupRoutes(this.express);
  }

  private errorHandler(): void {
    this.express.use(errorHandler);
  }
}

const app = new App();
const port = config.port;

const server = app.express.listen(port, () => {
  logger.info(`Server is running in ${config.nodeEnv} mode on port ${port}`);
});

process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    mongoDBConnection.disconnect().then(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  });
});

export { app };
