import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import 'reflect-metadata';
import { container } from 'tsyringe';
import { connect } from './config/database';
import { MedicationController } from './controllers/medication.controller';
import { AppError } from '../core/errors/app-error';

class Server {
  public app: express.Application;
  private port: number;

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.configureServices();
    this.configureMiddlewares();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureServices() {
    container.register('IMedicationService', { useClass: require('./services/medication.service').MedicationService });
    container.register('IMedicationRepository', { useClass: require('./repositories/mongodb/medication.repository').MedicationRepository });
  }

  private configureMiddlewares() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private configureRoutes() {
    const router = express.Router();
    const medicationController = container.resolve(MedicationController);

    router.get('/health', (_req, res) => {
      res.json({ status: 'ok' });
    });

    router.post('/medications', ...medicationController.createMedication);
    router.get('/medications/search', medicationController.searchMedications);
    router.post('/medications/extract-indications', medicationController.extractIndications);
    router.get('/medications', medicationController.getAllMedications);
    router.get('/medications/:id', medicationController.getMedication);
    router.put('/medications/:id', ...medicationController.updateMedication);
    router.delete('/medications/:id', medicationController.deleteMedication);

    this.app.use('/api', router);
  }

  private configureErrorHandling() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({
          status: 'error',
          message: err.message,
          code: err.code,
          ...(process.env.NODE_ENV === 'development' && err.details ? { details: err.details } : {}),
        });
      }

      if (err instanceof SyntaxError && 'type' in err) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid JSON in request body',
          code: 'INVALID_JSON',
        });
      }

      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Unhandled error:', err);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
        ...(process.env.NODE_ENV === 'development' ? { error: message } : {}),
      });
    });
  }

  public async start() {
    try {
      await connect();
      this.app.listen(this.port, () => {
        console.log(`Server is running on port ${this.port}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

const PORT = parseInt(process.env.PORT || '3000', 10);
const server = new Server(PORT);

if (require.main === module) {
  server.start();
}

export { server, Server };
