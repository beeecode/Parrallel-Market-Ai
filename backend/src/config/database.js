const mongoose = require('mongoose');

const { env } = require('./env');
const { logger } = require('./logger');

mongoose.connection.on('connected', () => {
  logger.info('MongoDB connection established.');
});

mongoose.connection.on('error', (error) => {
  logger.error({ err: error }, 'MongoDB connection error.');
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB connection lost.');
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Attempts to connect with backoff. Failure does not crash the process —
 * the API stays up and `/api/health` reports the database as disconnected.
 */
async function connectWithRetry() {
  for (let attempt = 1; attempt <= env.MONGO_MAX_RETRIES; attempt += 1) {
    try {
      await mongoose.connect(env.MONGODB_URI);
      return;
    } catch (error) {
      logger.warn(
        { err: error, attempt, maxRetries: env.MONGO_MAX_RETRIES },
        'MongoDB connection attempt failed.',
      );
      if (attempt === env.MONGO_MAX_RETRIES) {
        logger.error('Exhausted MongoDB connection retries. The API will continue running without a database.');
        return;
      }
      await sleep(env.MONGO_RETRY_DELAY_MS);
    }
  }
}

async function disconnectDatabase() {
  await mongoose.disconnect();
}

/** `true` when Mongoose reports an active connection (readyState === 1). */
function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = { connectWithRetry, disconnectDatabase, isDatabaseConnected };
