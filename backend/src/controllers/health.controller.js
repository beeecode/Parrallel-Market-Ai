const { HTTP_STATUS } = require('../constants/httpStatus');
const { getHealthStatus } = require('../services/health.service');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * Health has its own flat response shape (not the standard envelope) per spec:
 * `{ success, version, uptime, database, timestamp }`.
 */
const getHealth = asyncHandler(async (_req, res) => {
  const health = await getHealthStatus();
  const statusCode = health.status === 'ok' ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE;

  res.status(statusCode).json({
    success: health.status === 'ok',
    version: health.version,
    uptime: health.uptime,
    database: health.database,
    timestamp: health.timestamp,
  });
});

module.exports = { getHealth };
