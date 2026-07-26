const { HTTP_STATUS } = require('../constants/httpStatus');

/**
 * Sends a standardized success envelope: `{ success, message, data, errors, meta }`.
 * @param {import('express').Response} response
 * @param {Object} options
 * @param {number} [options.statusCode]
 * @param {string} options.message
 * @param {*} [options.data]
 * @param {Object} [options.meta]
 */
function sendSuccess(response, { statusCode = HTTP_STATUS.OK, message, data = null, meta = {} }) {
  response.status(statusCode).json({
    success: true,
    message,
    data,
    errors: [],
    meta: { timestamp: new Date().toISOString(), ...meta },
  });
}

module.exports = { sendSuccess };
