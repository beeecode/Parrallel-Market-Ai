const app = require('./app');
const { env } = require('./src/config/env');
const { connectWithRetry, disconnectDatabase } = require('./src/config/database');
const { logger } = require('./src/config/logger');

const server = app.listen(env.PORT, () => {
  logger.info(`Parallel Market AI API listening on port ${env.PORT} (${env.NODE_ENV}).`);
});

void connectWithRetry();

function shutdown(signal) {
  logger.info(`${signal} received. Closing API server.`);
  server.close(() => {
    disconnectDatabase().finally(() => {
      process.exit(0);
    });
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = server;
