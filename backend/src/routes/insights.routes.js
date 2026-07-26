const { Router } = require('express');

const insightController = require('../controllers/insight.controller');
const { authenticate } = require('../middlewares/authentication');
const { validate } = require('../middlewares/validate');
const { insightIdParamValidator, listInsightsValidator } = require('../validators/insight.validator');

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /insights:
 *   get:
 *     tags: [Insights]
 *     summary: List insights.
 *     description: >
 *       Insights are generated automatically when a report is generated —
 *       there is no manual creation endpoint. BUSINESS_OWNER sees only
 *       insights belonging to reports they own. ADMIN, ANALYST, and VIEWER
 *       see insights across every owner. Soft-deleted insights are never
 *       returned.
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
 *         description: Case-insensitive substring match against title, category, and description.
 *         schema: { type: string, example: conversion }
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
 *         description: Paginated insight list.
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
 *       422:
 *         description: Validation failed.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.get('/', listInsightsValidator, validate, insightController.list);

/**
 * @openapi
 * /insights/{id}:
 *   get:
 *     tags: [Insights]
 *     summary: Get a single insight by id.
 *     description: >
 *       BUSINESS_OWNER only sees insights belonging to reports they own —
 *       one belonging to someone else responds 404, not 403. ADMIN,
 *       ANALYST, and VIEWER may fetch any insight.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The insight.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties: { success: { type: boolean, example: true }, message: { type: string } }
 *                 - type: object
 *                   properties: { data: { type: object, properties: { insight: { $ref: '#/components/schemas/Insight' } } } }
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       404:
 *         description: Insight does not exist, is soft-deleted, or is not owned by the caller.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.get('/:id', insightIdParamValidator, validate, insightController.getById);

module.exports = router;
