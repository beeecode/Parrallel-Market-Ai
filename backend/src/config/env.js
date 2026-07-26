require('dotenv/config');

/**
 * The only file allowed to read `process.env` directly. Every other module
 * must import `env` from here instead.
 */

const REQUIRED_VARS = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];

for (const key of REQUIRED_VARS) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 4000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  MONGODB_URI: process.env.MONGODB_URI,
  MONGO_MAX_RETRIES: Number(process.env.MONGO_MAX_RETRIES) || 5,
  MONGO_RETRY_DELAY_MS: Number(process.env.MONGO_RETRY_DELAY_MS) || 2000,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  UPLOAD_PATH: process.env.UPLOAD_PATH || 'uploads',
  UPLOAD_MAX_FILE_SIZE_MB: Number(process.env.UPLOAD_MAX_FILE_SIZE_MB) || 5,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900_000,
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX) || 100,

  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

env.isProduction = env.NODE_ENV === 'production';
env.isTest = env.NODE_ENV === 'test';

module.exports = { env };
