const { Router } = require('express');

const customerController = require('../controllers/customer.controller');
const { ROLES } = require('../constants/roles');
const { authenticate } = require('../middlewares/authentication');
const { requireRoles } = require('../middlewares/authorization');
const { validate } = require('../middlewares/validate');
const {
  createCustomerValidator,
  customerIdParamValidator,
  listCustomersValidator,
  updateCustomerValidator,
} = require('../validators/customer.validator');

const router = Router();
const MANAGE_ROLES = [ROLES.ADMIN, ROLES.BUSINESS_OWNER];

router.use(authenticate);

/**
 * @openapi
 * /customers:
 *   get:
 *     tags: [Customers]
 *     summary: List customers.
 *     description: >
 *       BUSINESS_OWNER sees only their own customers. ADMIN, ANALYST, and
 *       VIEWER see customers across every owner. Soft-deleted customers are
 *       never returned.
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
 *         description: Case-insensitive substring match against fullName, email, and company.
 *         schema: { type: string, example: bright }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [fullName, company, createdAt, updatedAt], default: createdAt }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, inactive] }
 *     responses:
 *       200:
 *         description: Paginated customer list.
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
 *                         items: { type: array, items: { $ref: '#/components/schemas/Customer' } }
 *                         pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       422:
 *         description: Validation failed (bad page/limit/sort/order/status).
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.get('/', listCustomersValidator, validate, customerController.list);

/**
 * @openapi
 * /customers/{id}:
 *   get:
 *     tags: [Customers]
 *     summary: Get a single customer by id.
 *     description: >
 *       BUSINESS_OWNER only sees their own customers — a customer owned by
 *       someone else responds 404, not 403, to avoid revealing that it
 *       exists. ADMIN, ANALYST, and VIEWER may fetch any customer.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The customer.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties: { success: { type: boolean, example: true }, message: { type: string } }
 *                 - type: object
 *                   properties: { data: { type: object, properties: { customer: { $ref: '#/components/schemas/Customer' } } } }
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       404:
 *         description: Customer does not exist, is soft-deleted, or is not owned by the caller.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.get('/:id', customerIdParamValidator, validate, customerController.getById);

/**
 * @openapi
 * /customers:
 *   post:
 *     tags: [Customers]
 *     summary: Create a customer.
 *     description: Requires ADMIN or BUSINESS_OWNER. The customer is always owned by the authenticated caller. Customer emails must be unique per owner (case-insensitive).
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email]
 *             properties:
 *               fullName: { type: string, example: Amara Okafor }
 *               email: { type: string, format: email, example: amara@brightretail.com }
 *               phone: { type: string, example: "+2348012345678" }
 *               company: { type: string, example: Bright Retail Co. }
 *               industry: { type: string, example: Retail }
 *               jobTitle: { type: string, example: Head of Operations }
 *               country: { type: string, example: Nigeria }
 *               tags: { type: array, items: { type: string }, example: ["vip", "early-adopter"] }
 *               notes: { type: string, example: Interested in the enterprise tier. }
 *               status: { type: string, enum: [active, inactive], example: active }
 *     responses:
 *       201:
 *         description: Customer created.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties: { success: { type: boolean, example: true }, message: { type: string } }
 *                 - type: object
 *                   properties: { data: { type: object, properties: { customer: { $ref: '#/components/schemas/Customer' } } } }
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       403:
 *         description: Role is not permitted to create customers (ANALYST/VIEWER).
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       409:
 *         description: A customer with this email already exists for this owner.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       422:
 *         description: Validation failed.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.post('/', requireRoles(...MANAGE_ROLES), createCustomerValidator, validate, customerController.create);

/**
 * @openapi
 * /customers/{id}:
 *   patch:
 *     tags: [Customers]
 *     summary: Update a customer.
 *     description: Requires ADMIN or BUSINESS_OWNER. A BUSINESS_OWNER may only update their own customers.
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
 *               fullName: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               company: { type: string }
 *               industry: { type: string }
 *               jobTitle: { type: string }
 *               country: { type: string }
 *               tags: { type: array, items: { type: string } }
 *               notes: { type: string }
 *               status: { type: string, enum: [active, inactive] }
 *     responses:
 *       200:
 *         description: Customer updated.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties: { success: { type: boolean, example: true }, message: { type: string } }
 *                 - type: object
 *                   properties: { data: { type: object, properties: { customer: { $ref: '#/components/schemas/Customer' } } } }
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       403:
 *         description: Role is not permitted to update customers (ANALYST/VIEWER).
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       404:
 *         description: Customer does not exist, is soft-deleted, or is not owned by the caller.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       409:
 *         description: Changing the email would collide with another customer this owner already has.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       422:
 *         description: Validation failed.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.patch('/:id', requireRoles(...MANAGE_ROLES), customerIdParamValidator, updateCustomerValidator, validate, customerController.update);

/**
 * @openapi
 * /customers/{id}:
 *   delete:
 *     tags: [Customers]
 *     summary: Soft-delete a customer.
 *     description: >
 *       Sets `isActive` to false; the document is never physically removed.
 *       Requires ADMIN or BUSINESS_OWNER. A BUSINESS_OWNER may only delete
 *       their own customers.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Customer soft-deleted.
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       403:
 *         description: Role is not permitted to delete customers (ANALYST/VIEWER).
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       404:
 *         description: Customer does not exist, is already soft-deleted, or is not owned by the caller.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.delete('/:id', requireRoles(...MANAGE_ROLES), customerIdParamValidator, validate, customerController.remove);

module.exports = router;
