const { env } = require('../config/env');
const { logger } = require('../config/logger');
const { normalizeError } = require('../utils/normalizeError');

// Express recognizes error middleware by arity (4 params), so `_next` must
// stay even though it's unused here.
function errorHandler(error, req, res, _next) {
  const normalized = normalizeError(error);

  logger.error(
    { err: error, path: req.originalUrl, method: req.method, code: normalized.code },
    normalized.message,
  );

  const message = !normalized.isOperational && env.isProduction ? 'An unexpected server error occurred.' : normalized.message;

  res.status(normalized.statusCode).json({
    success: false,
    message,
    data: null,
    errors: normalized.errors,
    meta: {
      timestamp: new Date().toISOString(),
      ...(env.isProduction ? {} : { stack: error instanceof Error ? error.stack : undefined }),
    },
  });
}

module.exports = { errorHandler };
