const { createNotImplementedRouter } = require('../utils/notImplementedRouter');

/**
 * @openapi
 * /reports:
 *   get:
 *     tags: [Reports]
 *     summary: Reserved for reporting and insights endpoints.
 *     responses:
 *       501:
 *         description: Not implemented yet.
 */
module.exports = createNotImplementedRouter();
