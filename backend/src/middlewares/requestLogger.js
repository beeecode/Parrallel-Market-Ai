const morgan = require('morgan');

const { env } = require('../config/env');

// method, URL, status, and response time — Morgan's built-in tokens cover all four.
// Error responses are additionally logged with full detail by errorHandler.js.
const format = env.isProduction ? 'combined' : 'dev';

const requestLogger = morgan(format, {
  skip: () => env.isTest,
});

module.exports = { requestLogger };
