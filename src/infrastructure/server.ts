import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'reflect-metadata';
import { container } from 'tsyringe';
import { connect } from './config/database';
import { MedicationController } from './controllers/medication.controller';
import { errorHandler } from './middlewares/validation.middleware';

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
    this.app.use(helmet());

    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : [];
    this.app.use(
      cors({
        origin: allowedOrigins.length > 0 ? allowedOrigins : false,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      }),
    );

    this.app.use(express.json({ limit: '1mb' }));

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: { status: 'error', message: 'Too many requests, please try again later.' },
    });
    this.app.use(limiter);
  }

  private configureRoutes() {
    const router = express.Router();
    const medicationController = container.resolve(MedicationController);

    router.get('/health', (_req, res) => {
      res.json({ status: 'ok' });
    });

    router.post('/medications', ...medicationController.createMedication);
    router.get('/medications', medicationController.getAllMedications);
    router.get('/medications/:id', medicationController.getMedication);
    router.put('/medications/:id', ...medicationController.updateMedication);
    router.delete('/medications/:id', medicationController.deleteMedication);
    router.get('/medications/search', medicationController.searchMedications);
    router.post('/medications/extract-indications', medicationController.extractIndications);

    this.app.use('/api', router);
  }

  private configureErrorHandling() {
    this.app.use(errorHandler);
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
