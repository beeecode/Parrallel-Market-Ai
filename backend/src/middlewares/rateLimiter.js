const rateLimit = require('express-rate-limit');

const { env } = require('../config/env');
const { ERROR_CODES } = require('../constants/errorCodes');

const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      data: null,
      errors: [{ code: ERROR_CODES.RATE_LIMITED, message: 'Rate limit exceeded.' }],
      meta: { timestamp: new Date().toISOString() },
    });
  },
});

module.exports = { rateLimiter };
