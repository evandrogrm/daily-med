export const TestConfig = {
  DB_NAME: 'dailymed-test',
  DB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/dailymed-test',

  PORT: 3001,
  HOST: '0.0.0.0',

  JWT_SECRET: 'test-secret',
  JWT_EXPIRES_IN: '1h',

  TEST_TIMEOUT: 30000,

  API_PREFIX: '/api',

  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,

  TEST_USER: {
    email: 'test@example.com',
    password: 'password123',
  },

  MOCK_MEDICATION_COUNT: 5,
};

export default TestConfig;
