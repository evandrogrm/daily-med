import cors from 'cors';
import express, { Application } from 'express';
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
    this.express.use(cors());
    this.express.use(express.json());
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
