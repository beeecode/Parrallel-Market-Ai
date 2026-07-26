const { createNotImplementedRouter } = require('../utils/notImplementedRouter');

/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Reserved for user management endpoints.
 *     responses:
 *       501:
 *         description: Not implemented yet.
 */
module.exports = createNotImplementedRouter();
