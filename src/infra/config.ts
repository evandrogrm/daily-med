import dotenv from 'dotenv';
import { cleanEnv, num, str } from 'envalid';

dotenv.config();

const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ['development', 'test', 'production', 'staging'],
    default: 'development',
  }),
  PORT: num({ default: 3000 }),
  MONGODB_URI: str({
    default: 'mongodb://localhost:27017/dailymed',
  }),
  JWT_SECRET: str({
    default: 'your_jwt_secret_here',
    desc: 'Secret key for JWT token generation',
  }),
  JWT_EXPIRES_IN: str({
    default: '1d',
    desc: 'JWT token expiration time',
  }),
  LOG_LEVEL: str({
    default: 'info',
    choices: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'],
  }),
  DAILYMED_API_URL: str({
    default: 'https://dailymed.nlm.nih.gov/dailymed/services/v2',
  }),
  OPENAI_API_KEY: str({
    default: '',
    desc: 'API key for OpenAI (for LLM features)',
  }),
});

const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  mongoUri: env.MONGODB_URI,
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  logLevel: env.LOG_LEVEL,
  dailymedApiUrl: env.DAILYMED_API_URL,
  openaiApiKey: env.OPENAI_API_KEY,
  isDevelopment: env.NODE_ENV === 'development',
  isTest: env.NODE_ENV === 'test',
  isProduction: env.NODE_ENV === 'production',
} as const;

export { config };
