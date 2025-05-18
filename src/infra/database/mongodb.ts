import { MongoClient, Db } from 'mongodb';
import { config } from '../config';
import { logger } from '../logger';

class MongoDBConnection {
  private static instance: MongoDBConnection;
  private client: MongoClient;
  private db: Db | null = null;

  private constructor() {
    this.client = new MongoClient(config.mongoUri);
  }

  public static getInstance(): MongoDBConnection {
    if (!MongoDBConnection.instance) {
      MongoDBConnection.instance = new MongoDBConnection();
    }
    return MongoDBConnection.instance;
  }

  public async connect(): Promise<Db> {
    if (this.db) {
      return this.db;
    }

    try {
      await this.client.connect();
      this.db = this.client.db();
      logger.info('Connected to MongoDB');
      return this.db;
    } catch (error) {
      logger.error('Failed to connect to MongoDB', { error });
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.client.close();
      this.db = null;
      logger.info('Disconnected from MongoDB');
    } catch (error) {
      logger.error('Error disconnecting from MongoDB', { error });
      throw error;
    }
  }

  public getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db;
  }
}

export const mongoDBConnection = MongoDBConnection.getInstance();
export { Db } from 'mongodb';
