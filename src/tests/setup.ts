import 'reflect-metadata';
import { container } from 'tsyringe';
import { clearDatabase, connect, disconnect } from '../../src/infrastructure/config/database';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/dailymed-test';
process.env.JWT_SECRET = 'test-secret';

// Increase timeout for all tests
jest.setTimeout(60000);

// Global test setup
beforeAll(async () => {
  try {
    await connect();
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
});

// Global test teardown
afterAll(async () => {
  try {
    await disconnect();
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  } finally {
    container.clearInstances();
  }
});

// Clean up after each test
afterEach(async () => {
  try {
    await clearDatabase();
    container.clearInstances();
    jest.clearAllMocks();
  } catch (error) {
    console.error('Error during test cleanup:', error);
    throw error;
  }
});

// Suppress Mongoose deprecation warnings
const originalWarn = console.warn;
const originalError = console.error;

beforeEach(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  console.warn = originalWarn;
  console.error = originalError;
});
