const { Router } = require('express');

const customerAgentController = require('../controllers/customerAgent.controller');
const { ROLES } = require('../constants/roles');
const { authenticate } = require('../middlewares/authentication');
const { requireRoles } = require('../middlewares/authorization');
const { validate } = require('../middlewares/validate');
const {
  createCustomerAgentValidator,
  customerAgentIdParamValidator,
  listCustomerAgentsValidator,
  updateCustomerAgentValidator,
} = require('../validators/customerAgent.validator');

const router = Router();
const MANAGE_ROLES = [ROLES.ADMIN, ROLES.BUSINESS_OWNER];

router.use(authenticate);

/**
 * @openapi
 * /customer-agents:
 *   get:
 *     tags: [Customer Agents]
 *     summary: List customer agents.
 *     description: >
 *       BUSINESS_OWNER sees only agents belonging to simulations they own.
 *       ADMIN, ANALYST, and VIEWER see agents across every owner.
 *       Soft-deleted agents are never returned.
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
 *         description: Case-insensitive substring match against name, occupation, location, and personality.
 *         schema: { type: string, example: chen }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [name, status, createdAt, updatedAt], default: createdAt }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, inactive] }
 *     responses:
 *       200:
 *         description: Paginated customer agent list.
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
 *                         items: { type: array, items: { $ref: '#/components/schemas/CustomerAgent' } }
 *                         pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       422:
 *         description: Validation failed.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.get('/', listCustomerAgentsValidator, validate, customerAgentController.list);

/**
 * @openapi
 * /customer-agents/{id}:
 *   get:
 *     tags: [Customer Agents]
 *     summary: Get a single customer agent by id.
 *     description: >
 *       BUSINESS_OWNER only sees agents belonging to simulations they own —
 *       one belonging to someone else responds 404, not 403. ADMIN,
 *       ANALYST, and VIEWER may fetch any agent.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The customer agent.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties: { success: { type: boolean, example: true }, message: { type: string } }
 *                 - type: object
 *                   properties: { data: { type: object, properties: { customerAgent: { $ref: '#/components/schemas/CustomerAgent' } } } }
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       404:
 *         description: Customer agent does not exist, is soft-deleted, or is not owned by the caller.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.get('/:id', customerAgentIdParamValidator, validate, customerAgentController.getById);

/**
 * @openapi
 * /customer-agents:
 *   post:
 *     tags: [Customer Agents]
 *     summary: Create a customer agent.
 *     description: >
 *       Requires ADMIN or BUSINESS_OWNER. The referenced simulation must
 *       exist and be accessible to the caller (404 otherwise). The agent's
 *       owner is always inherited from the simulation's owner, not the
 *       caller — this keeps ownership consistent even when an ADMIN creates
 *       an agent on someone else's simulation. Names must be unique per
 *       simulation (case-insensitive). Creating an agent triggers a
 *       recalculation of the parent simulation's statistics.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [simulation, name]
 *             properties:
 *               simulation: { type: string, example: 6702a1f1a1b2c3d4e5f60aaa }
 *               name: { type: string, example: Sarah Chen }
 *               avatar: { type: string, example: "https://cdn.example.com/agents/sarah-chen.png" }
 *               age: { type: integer, minimum: 0, maximum: 120, example: 34 }
 *               occupation: { type: string, example: Operations Manager }
 *               location: { type: string, example: "Austin, TX" }
 *               income: { type: string, example: "$60,000–$80,000" }
 *               personality: { type: string, example: Analytical, cautious, detail-oriented }
 *               goals: { type: array, items: { type: string }, example: ["Reduce operational costs"] }
 *               painPoints: { type: array, items: { type: string }, example: ["Limited budget"] }
 *               buyingBehavior: { type: string }
 *               communicationStyle: { type: string }
 *               sentiment: { type: string, enum: [positive, neutral, negative, mixed], example: neutral }
 *               status: { type: string, enum: [active, inactive], example: active }
 *               metadata:
 *                 type: object
 *                 properties:
 *                   tags: { type: array, items: { type: string } }
 *                   score: { type: integer, minimum: 0, maximum: 100 }
 *                   notes: { type: string }
 *     responses:
 *       201:
 *         description: Customer agent created.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties: { success: { type: boolean, example: true }, message: { type: string } }
 *                 - type: object
 *                   properties: { data: { type: object, properties: { customerAgent: { $ref: '#/components/schemas/CustomerAgent' } } } }
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       403:
 *         description: Role is not permitted to create customer agents (ANALYST/VIEWER).
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       404:
 *         description: The referenced simulation does not exist or is not owned by the caller.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       409:
 *         description: This simulation already has a customer agent with this name.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       422:
 *         description: Validation failed.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.post('/', requireRoles(...MANAGE_ROLES), createCustomerAgentValidator, validate, customerAgentController.create);

/**
 * @openapi
 * /customer-agents/{id}:
 *   patch:
 *     tags: [Customer Agents]
 *     summary: Update a customer agent.
 *     description: Requires ADMIN or BUSINESS_OWNER. A BUSINESS_OWNER may only update agents belonging to simulations they own. The parent `simulation` cannot be changed.
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
 *               name: { type: string }
 *               avatar: { type: string }
 *               age: { type: integer, minimum: 0, maximum: 120 }
 *               occupation: { type: string }
 *               location: { type: string }
 *               income: { type: string }
 *               personality: { type: string }
 *               goals: { type: array, items: { type: string } }
 *               painPoints: { type: array, items: { type: string } }
 *               buyingBehavior: { type: string }
 *               communicationStyle: { type: string }
 *               sentiment: { type: string, enum: [positive, neutral, negative, mixed] }
 *               status: { type: string, enum: [active, inactive] }
 *               metadata:
 *                 type: object
 *                 properties:
 *                   tags: { type: array, items: { type: string } }
 *                   score: { type: integer, minimum: 0, maximum: 100 }
 *                   notes: { type: string }
 *     responses:
 *       200:
 *         description: Customer agent updated.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties: { success: { type: boolean, example: true }, message: { type: string } }
 *                 - type: object
 *                   properties: { data: { type: object, properties: { customerAgent: { $ref: '#/components/schemas/CustomerAgent' } } } }
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       403:
 *         description: Role is not permitted to update customer agents (ANALYST/VIEWER).
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       404:
 *         description: Customer agent does not exist, is soft-deleted, or is not owned by the caller.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       409:
 *         description: Renaming collides with another agent in the same simulation.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       422:
 *         description: Validation failed.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.patch('/:id', requireRoles(...MANAGE_ROLES), customerAgentIdParamValidator, updateCustomerAgentValidator, validate, customerAgentController.update);

/**
 * @openapi
 * /customer-agents/{id}:
 *   delete:
 *     tags: [Customer Agents]
 *     summary: Soft-delete a customer agent.
 *     description: >
 *       Sets `isActive` to false; the document is never physically removed.
 *       Triggers a recalculation of the parent simulation's statistics.
 *       Requires ADMIN or BUSINESS_OWNER.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Customer agent soft-deleted.
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       403:
 *         description: Role is not permitted to delete customer agents (ANALYST/VIEWER).
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       404:
 *         description: Customer agent does not exist, is already soft-deleted, or is not owned by the caller.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.delete('/:id', requireRoles(...MANAGE_ROLES), customerAgentIdParamValidator, validate, customerAgentController.remove);

module.exports = router;
