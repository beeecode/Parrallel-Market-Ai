const { createNotImplementedRouter } = require('../utils/notImplementedRouter');

/**
 * @openapi
 * /messages:
 *   get:
 *     tags: [Messages]
 *     summary: Reserved for conversation and message endpoints.
 *     responses:
 *       501:
 *         description: Not implemented yet.
 */
module.exports = createNotImplementedRouter();
