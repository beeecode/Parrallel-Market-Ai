const packageJson = require('../../package.json');
const { env } = require('../config/env');
const { checkDatabaseConnection } = require('../repositories/health.repository');

async function getHealthStatus() {
  const isDatabaseHealthy = await checkDatabaseConnection();

  return {
    status: isDatabaseHealthy ? 'ok' : 'degraded',
    version: packageJson.version,
    uptime: process.uptime(),
    database: isDatabaseHealthy ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  };
}

module.exports = { getHealthStatus };
