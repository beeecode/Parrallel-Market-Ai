const { Router } = require('express');

const { getHealth } = require('../controllers/health.controller');

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Report API and database health.
 *     responses:
 *       200:
 *         description: API and database are healthy.
 *       503:
 *         description: API is running but the database is unreachable.
 */
router.get('/', getHealth);

module.exports = router;
