const { Router } = require('express');

const insightController = require('../controllers/insight.controller');
const reportController = require('../controllers/report.controller');
const { ROLES } = require('../constants/roles');
const { authenticate } = require('../middlewares/authentication');
const { requireRoles } = require('../middlewares/authorization');
const { validate } = require('../middlewares/validate');
const { listInsightsValidator } = require('../validators/insight.validator');
const {
  generateReportValidator,
  listReportsValidator,
  reportIdParamValidator,
  updateReportValidator,
} = require('../validators/report.validator');

const router = Router();
const MANAGE_ROLES = [ROLES.ADMIN, ROLES.BUSINESS_OWNER];

router.use(authenticate);

/**
 * @openapi
 * /reports:
 *   get:
 *     tags: [Reports]
 *     summary: List reports.
 *     description: >
 *       BUSINESS_OWNER sees only their own reports. ADMIN, ANALYST, and
 *       VIEWER see reports across every owner. Soft-deleted (archived)
 *       reports are never returned.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *       - in: query
 *         name: search
 *         description: Case-insensitive substring match against title, description, and summary.
 *         schema: { type: string, example: growth }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [title, status, createdAt, generatedAt, conversionScore, engagementScore], default: createdAt }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [Draft, Generated, Archived] }
 *     responses:
 *       200:
 *         description: Paginated report list.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties: { success: { type: boolean, example: true }, message: { type: string } }
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         items: { type: array, items: { $ref: '#/components/schemas/Report' } }
 *                         pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       422:
 *         description: Validation failed.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.get('/', listReportsValidator, validate, reportController.list);

/**
 * @openapi
 * /reports/{id}:
 *   get:
 *     tags: [Reports]
 *     summary: Get a single report by id.
 *     description: BUSINESS_OWNER only sees their own reports — one owned by someone else responds 404, not 403. ADMIN, ANALYST, and VIEWER may fetch any report.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The report.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties: { success: { type: boolean, example: true }, message: { type: string } }
 *                 - type: object
 *                   properties: { data: { type: object, properties: { report: { $ref: '#/components/schemas/Report' } } } }
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       404:
 *         description: Report does not exist, is archived, or is not owned by the caller.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.get('/:id', reportIdParamValidator, validate, reportController.getById);

/**
 * @openapi
 * /reports/{id}/insights:
 *   get:
 *     tags: [Insights]
 *     summary: List the insights belonging to a report.
 *     description: Access to the report is the only gate — if you can read the report, you can read its insights.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [title, importance, score, createdAt, updatedAt], default: createdAt }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *       - in: query
 *         name: importance
 *         schema: { type: string, enum: [Low, Medium, High, Critical] }
 *       - in: query
 *         name: trend
 *         schema: { type: string, enum: [Positive, Neutral, Negative] }
 *     responses:
 *       200:
 *         description: Paginated insight list for this report.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties: { success: { type: boolean, example: true }, message: { type: string } }
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         items: { type: array, items: { $ref: '#/components/schemas/Insight' } }
 *                         pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       404:
 *         description: Report does not exist, is archived, or is not owned by the caller.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.get('/:id/insights', reportIdParamValidator, listInsightsValidator, validate, insightController.listForReport);

/**
 * @openapi
 * /reports/generate:
 *   post:
 *     tags: [Reports]
 *     summary: Generate a report from a completed simulation.
 *     description: >
 *       Requires ADMIN or BUSINESS_OWNER. The simulation must be accessible
 *       to the caller (404 otherwise) and must have status "completed"
 *       (409 otherwise). Only one active report may exist per simulation —
 *       calling this again for the same simulation returns the existing
 *       report (200) instead of creating a duplicate (201 only on first
 *       generation). `metrics`, `recommendations`, `generatedAt`, and
 *       `generatedBy` are always server-computed and cannot be submitted.
 *       Generation also creates a deterministic set of Insights for the
 *       report (see `GET /reports/{id}/insights`).
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [simulation]
 *             properties:
 *               simulation: { type: string, example: 6702a1f1a1b2c3d4e5f60aaa }
 *               title: { type: string, example: Q1 Growth Cohort Beta — Report }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Report generated for the first time.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties: { success: { type: boolean, example: true }, message: { type: string } }
 *                 - type: object
 *                   properties: { data: { type: object, properties: { report: { $ref: '#/components/schemas/Report' } } } }
 *       200:
 *         description: An active report already existed for this simulation; it is returned unchanged.
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       403:
 *         description: Role is not permitted to generate reports (ANALYST/VIEWER).
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       404:
 *         description: The referenced simulation does not exist or is not owned by the caller.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       409:
 *         description: The simulation is not completed (status is draft, running, paused, or cancelled).
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       422:
 *         description: Validation failed.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.post('/generate', requireRoles(...MANAGE_ROLES), generateReportValidator, validate, reportController.generate);

/**
 * @openapi
 * /reports/{id}:
 *   patch:
 *     tags: [Reports]
 *     summary: Update a report's narrative fields.
 *     description: Requires ADMIN or BUSINESS_OWNER. Only `title`, `description`, and `summary` may be changed — `metrics`, `recommendations`, `generatedAt`, and `generatedBy` are never accepted.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               summary: { type: string }
 *     responses:
 *       200:
 *         description: Report updated.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties: { success: { type: boolean, example: true }, message: { type: string } }
 *                 - type: object
 *                   properties: { data: { type: object, properties: { report: { $ref: '#/components/schemas/Report' } } } }
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       403:
 *         description: Role is not permitted to update reports (ANALYST/VIEWER).
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       404:
 *         description: Report does not exist, is archived, or is not owned by the caller.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       422:
 *         description: Validation failed.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.patch('/:id', requireRoles(...MANAGE_ROLES), reportIdParamValidator, updateReportValidator, validate, reportController.update);

/**
 * @openapi
 * /reports/{id}:
 *   delete:
 *     tags: [Reports]
 *     summary: Soft-delete (archive) a report.
 *     description: >
 *       Sets `isActive` to false and cascades the same soft-delete to every
 *       active insight belonging to this report — insights are never
 *       physically removed. Identical in effect to
 *       `PATCH /reports/{id}/archive`. Requires ADMIN or BUSINESS_OWNER.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Report (and its insights) soft-deleted.
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       403:
 *         description: Role is not permitted to delete reports (ANALYST/VIEWER).
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       404:
 *         description: Report does not exist, is already archived, or is not owned by the caller.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.delete('/:id', requireRoles(...MANAGE_ROLES), reportIdParamValidator, validate, reportController.remove);

/**
 * @openapi
 * /reports/{id}/archive:
 *   patch:
 *     tags: [Reports]
 *     summary: Archive a report (alias of DELETE).
 *     description: Identical operation to `DELETE /reports/{id}`. Requires ADMIN or BUSINESS_OWNER.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Report (and its insights) soft-deleted.
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       403:
 *         description: Role is not permitted to archive reports (ANALYST/VIEWER).
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       404:
 *         description: Report does not exist, is already archived, or is not owned by the caller.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.patch('/:id/archive', requireRoles(...MANAGE_ROLES), reportIdParamValidator, validate, reportController.archive);

/**
 * @openapi
 * /reports/{id}/restore:
 *   patch:
 *     tags: [Reports]
 *     summary: Restore a previously archived report.
 *     description: >
 *       Sets `isActive` back to true. Does not cascade-restore insights —
 *       any insight soft-deleted independently before the report was
 *       archived must remain as-is; there is no manual insight-restore
 *       endpoint. Requires ADMIN or BUSINESS_OWNER.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Report restored.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties: { success: { type: boolean, example: true }, message: { type: string } }
 *                 - type: object
 *                   properties: { data: { type: object, properties: { report: { $ref: '#/components/schemas/Report' } } } }
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       403:
 *         description: Role is not permitted to restore reports (ANALYST/VIEWER).
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       404:
 *         description: Report does not exist or is not owned by the caller.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       409:
 *         description: Report is not currently archived.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.patch('/:id/restore', requireRoles(...MANAGE_ROLES), reportIdParamValidator, validate, reportController.restore);

module.exports = router;
