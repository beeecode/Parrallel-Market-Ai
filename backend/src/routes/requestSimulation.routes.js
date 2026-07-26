const { createNotImplementedRouter } = require('../utils/notImplementedRouter');

/**
 * @openapi
 * /request-simulation:
 *   get:
 *     tags: [Request Simulation]
 *     summary: Reserved for the custom simulation request endpoints.
 *     responses:
 *       501:
 *         description: Not implemented yet.
 */
module.exports = createNotImplementedRouter();
