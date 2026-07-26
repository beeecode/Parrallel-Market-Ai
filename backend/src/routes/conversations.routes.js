const { Router } = require('express');

const conversationController = require('../controllers/conversation.controller');
const messageController = require('../controllers/message.controller');
const { ROLES } = require('../constants/roles');
const { authenticate } = require('../middlewares/authentication');
const { requireRoles } = require('../middlewares/authorization');
const { validate } = require('../middlewares/validate');
const { listMessagesValidator } = require('../validators/message.validator');
const {
  conversationIdParamValidator,
  createConversationValidator,
  listConversationsValidator,
  updateConversationValidator,
} = require('../validators/conversation.validator');

const router = Router();
const MANAGE_ROLES = [ROLES.ADMIN, ROLES.BUSINESS_OWNER];

router.use(authenticate);

/**
 * @openapi
 * /conversations:
 *   get:
 *     tags: [Conversations]
 *     summary: List conversations.
 *     description: >
 *       BUSINESS_OWNER sees only their own conversations. ADMIN, ANALYST,
 *       and VIEWER see conversations across every owner. Soft-deleted
 *       (archived) conversations are never returned.
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
 *         description: Case-insensitive substring match against title and metadata.tags.
 *         schema: { type: string, example: pricing }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [createdAt, updatedAt, lastActivity, messageCount], default: createdAt }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [Open, Closed, Archived] }
 *       - in: query
 *         name: simulation
 *         schema: { type: string }
 *       - in: query
 *         name: customerAgent
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated conversation list.
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
 *                         items: { type: array, items: { $ref: '#/components/schemas/Conversation' } }
 *                         pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       422:
 *         description: Validation failed.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.get('/', listConversationsValidator, validate, conversationController.list);

/**
 * @openapi
 * /conversations/{id}:
 *   get:
 *     tags: [Conversations]
 *     summary: Get a single conversation by id.
 *     description: BUSINESS_OWNER only sees their own conversations — one owned by someone else responds 404, not 403. ADMIN, ANALYST, and VIEWER may fetch any conversation.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The conversation.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties: { success: { type: boolean, example: true }, message: { type: string } }
 *                 - type: object
 *                   properties: { data: { type: object, properties: { conversation: { $ref: '#/components/schemas/Conversation' } } } }
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       404:
 *         description: Conversation does not exist, is archived, or is not owned by the caller.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.get('/:id', conversationIdParamValidator, validate, conversationController.getById);

/**
 * @openapi
 * /conversations/{id}/messages:
 *   get:
 *     tags: [Messages]
 *     summary: List the messages belonging to a conversation.
 *     description: Access to the conversation is the only gate — if you can read the conversation, you can read its messages.
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
 *         description: Case-insensitive substring match against content.
 *         schema: { type: string }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [createdAt, updatedAt], default: createdAt }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200:
 *         description: Paginated message list for this conversation.
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
 *                         items: { type: array, items: { $ref: '#/components/schemas/Message' } }
 *                         pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       404:
 *         description: Conversation does not exist, is archived, or is not owned by the caller.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.get('/:id/messages', conversationIdParamValidator, listMessagesValidator, validate, messageController.listForConversation);

/**
 * @openapi
 * /conversations:
 *   post:
 *     tags: [Conversations]
 *     summary: Create a conversation.
 *     description: >
 *       Requires ADMIN or BUSINESS_OWNER. The referenced customer agent
 *       must exist and be accessible to the caller (404 otherwise).
 *       `owner` and `simulation` are always derived from the agent, never
 *       accepted from the client.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customerAgent, title]
 *             properties:
 *               customerAgent: { type: string, example: 6702a1f1a1b2c3d4e5f60bbb }
 *               title: { type: string, example: Pricing objections walkthrough }
 *               metadata: { $ref: '#/components/schemas/ConversationMetadata' }
 *     responses:
 *       201:
 *         description: Conversation created.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties: { success: { type: boolean, example: true }, message: { type: string } }
 *                 - type: object
 *                   properties: { data: { type: object, properties: { conversation: { $ref: '#/components/schemas/Conversation' } } } }
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       403:
 *         description: Role is not permitted to create conversations (ANALYST/VIEWER).
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       404:
 *         description: The referenced customer agent does not exist or is not owned by the caller.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       422:
 *         description: Validation failed.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.post('/', requireRoles(...MANAGE_ROLES), createConversationValidator, validate, conversationController.create);

/**
 * @openapi
 * /conversations/{id}:
 *   patch:
 *     tags: [Conversations]
 *     summary: Update a conversation.
 *     description: >
 *       Requires ADMIN or BUSINESS_OWNER. `status` may only be set to
 *       "Open" or "Closed" here — "Archived" is only ever set via
 *       `PATCH /conversations/{id}/archive`. `messageCount`, `lastMessage`,
 *       and `lastActivity` are never accepted.
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
 *               status: { type: string, enum: [Open, Closed] }
 *               metadata: { $ref: '#/components/schemas/ConversationMetadata' }
 *     responses:
 *       200:
 *         description: Conversation updated.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties: { success: { type: boolean, example: true }, message: { type: string } }
 *                 - type: object
 *                   properties: { data: { type: object, properties: { conversation: { $ref: '#/components/schemas/Conversation' } } } }
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       403:
 *         description: Role is not permitted to update conversations (ANALYST/VIEWER).
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       404:
 *         description: Conversation does not exist, is archived, or is not owned by the caller.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       422:
 *         description: Validation failed.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.patch('/:id', requireRoles(...MANAGE_ROLES), conversationIdParamValidator, updateConversationValidator, validate, conversationController.update);

/**
 * @openapi
 * /conversations/{id}:
 *   delete:
 *     tags: [Conversations]
 *     summary: Soft-delete (archive) a conversation.
 *     description: >
 *       Sets `isActive` to false and cascades the same soft-delete to every
 *       message in this conversation — messages are never physically
 *       removed. Identical in effect to `PATCH /conversations/{id}/archive`.
 *       Requires ADMIN or BUSINESS_OWNER.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Conversation (and its messages) soft-deleted.
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       403:
 *         description: Role is not permitted to delete conversations (ANALYST/VIEWER).
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       404:
 *         description: Conversation does not exist, is already archived, or is not owned by the caller.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.delete('/:id', requireRoles(...MANAGE_ROLES), conversationIdParamValidator, validate, conversationController.remove);

/**
 * @openapi
 * /conversations/{id}/archive:
 *   patch:
 *     tags: [Conversations]
 *     summary: Archive a conversation (alias of DELETE).
 *     description: Identical operation to `DELETE /conversations/{id}`. Requires ADMIN or BUSINESS_OWNER.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Conversation (and its messages) soft-deleted.
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       403:
 *         description: Role is not permitted to archive conversations (ANALYST/VIEWER).
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       404:
 *         description: Conversation does not exist, is already archived, or is not owned by the caller.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.patch('/:id/archive', requireRoles(...MANAGE_ROLES), conversationIdParamValidator, validate, conversationController.archive);

/**
 * @openapi
 * /conversations/{id}/restore:
 *   patch:
 *     tags: [Conversations]
 *     summary: Restore a previously archived conversation.
 *     description: >
 *       Sets `isActive` back to true and reopens the conversation
 *       (`status: "Open"`). Does not cascade-restore messages — any
 *       message soft-deleted by the archive cascade (or independently)
 *       stays soft-deleted; there is no message-restore endpoint. Requires
 *       ADMIN or BUSINESS_OWNER.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Conversation restored.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties: { success: { type: boolean, example: true }, message: { type: string } }
 *                 - type: object
 *                   properties: { data: { type: object, properties: { conversation: { $ref: '#/components/schemas/Conversation' } } } }
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       403:
 *         description: Role is not permitted to restore conversations (ANALYST/VIEWER).
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       404:
 *         description: Conversation does not exist or is not owned by the caller.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       409:
 *         description: Conversation is not currently archived.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.patch('/:id/restore', requireRoles(...MANAGE_ROLES), conversationIdParamValidator, validate, conversationController.restore);

module.exports = router;
