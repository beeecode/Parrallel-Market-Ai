const { Router } = require('express');

const messageController = require('../controllers/message.controller');
const { ROLES } = require('../constants/roles');
const { authenticate } = require('../middlewares/authentication');
const { requireRoles } = require('../middlewares/authorization');
const { validate } = require('../middlewares/validate');
const {
  messageIdParamValidator,
  sendMessageValidator,
  updateMessageValidator,
} = require('../validators/message.validator');

const router = Router();
const MANAGE_ROLES = [ROLES.ADMIN, ROLES.BUSINESS_OWNER];

router.use(authenticate);

/**
 * @openapi
 * /messages:
 *   post:
 *     tags: [Messages]
 *     summary: Send a message in a conversation.
 *     description: >
 *       Requires ADMIN or BUSINESS_OWNER. The referenced conversation must
 *       be accessible to the caller (404 otherwise). `sender` is always
 *       derived server-side from `senderType` — "User" resolves to the
 *       caller, "CustomerAgent" resolves to the conversation's own agent,
 *       "System" has no sender — never accepted from the client. Sending a
 *       message automatically updates the conversation's `messageCount`,
 *       `lastMessage`, and `lastActivity`.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [conversation, senderType, content]
 *             properties:
 *               conversation: { type: string, example: 6902a1f1a1b2c3d4e5f60eee }
 *               senderType: { type: string, enum: [User, CustomerAgent, System], example: User }
 *               content: { type: string, example: Can you walk me through the pricing tiers again? }
 *               type: { type: string, enum: [Text, System, Event, Notification], example: Text }
 *               attachments: { type: array, items: { $ref: '#/components/schemas/MessageAttachment' } }
 *               metadata: { $ref: '#/components/schemas/ConversationMetadata' }
 *     responses:
 *       201:
 *         description: Message sent.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties: { success: { type: boolean, example: true }, message: { type: string } }
 *                 - type: object
 *                   properties: { data: { type: object, properties: { message: { $ref: '#/components/schemas/Message' } } } }
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       403:
 *         description: Role is not permitted to send messages (ANALYST/VIEWER).
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       404:
 *         description: The referenced conversation does not exist or is not owned by the caller.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       422:
 *         description: Validation failed.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.post('/', requireRoles(...MANAGE_ROLES), sendMessageValidator, validate, messageController.sendMessage);

/**
 * @openapi
 * /messages/{id}:
 *   get:
 *     tags: [Messages]
 *     summary: Get a single message by id.
 *     description: >
 *       BUSINESS_OWNER only sees messages belonging to conversations they
 *       own — one belonging to someone else responds 404, not 403. ADMIN,
 *       ANALYST, and VIEWER may fetch any message.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The message.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties: { success: { type: boolean, example: true }, message: { type: string } }
 *                 - type: object
 *                   properties: { data: { type: object, properties: { message: { $ref: '#/components/schemas/Message' } } } }
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       404:
 *         description: Message does not exist, is deleted, or is not owned by the caller.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.get('/:id', messageIdParamValidator, validate, messageController.getById);

/**
 * @openapi
 * /messages/{id}:
 *   patch:
 *     tags: [Messages]
 *     summary: Edit a message's content/attachments/metadata.
 *     description: >
 *       Requires ADMIN or BUSINESS_OWNER. Changing `content` automatically
 *       sets `edited: true` and `editedAt` to the current server time —
 *       neither can be set directly. `sender`, `senderType`, `conversation`,
 *       `status`, `isRead`, `readAt`, `deleted`, and `deletedAt` are never
 *       accepted here.
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
 *               content: { type: string }
 *               attachments: { type: array, items: { $ref: '#/components/schemas/MessageAttachment' } }
 *               metadata: { $ref: '#/components/schemas/ConversationMetadata' }
 *     responses:
 *       200:
 *         description: Message updated.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties: { success: { type: boolean, example: true }, message: { type: string } }
 *                 - type: object
 *                   properties: { data: { type: object, properties: { message: { $ref: '#/components/schemas/Message' } } } }
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       403:
 *         description: Role is not permitted to update messages (ANALYST/VIEWER).
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       404:
 *         description: Message does not exist, is deleted, or is not owned by the caller.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       422:
 *         description: Validation failed.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.patch('/:id', requireRoles(...MANAGE_ROLES), messageIdParamValidator, updateMessageValidator, validate, messageController.update);

/**
 * @openapi
 * /messages/{id}:
 *   delete:
 *     tags: [Messages]
 *     summary: Soft-delete a message.
 *     description: >
 *       Sets `deleted: true` and `deletedAt` to the current server time —
 *       the document is never physically removed. Automatically
 *       decrements the conversation's `messageCount` and recomputes
 *       `lastMessage`/`lastActivity` from what remains. Requires ADMIN or
 *       BUSINESS_OWNER.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Message soft-deleted.
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       403:
 *         description: Role is not permitted to delete messages (ANALYST/VIEWER).
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       404:
 *         description: Message does not exist, is already deleted, or is not owned by the caller.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.delete('/:id', requireRoles(...MANAGE_ROLES), messageIdParamValidator, validate, messageController.remove);

/**
 * @openapi
 * /messages/{id}/read:
 *   patch:
 *     tags: [Messages]
 *     summary: Mark a message as read.
 *     description: >
 *       Sets `status: "Read"`, `isRead: true`, and `readAt` to the current
 *       server time — `readAt` can never be set directly or backdated by a
 *       client. Requires ADMIN or BUSINESS_OWNER.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Message marked as read.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties: { success: { type: boolean, example: true }, message: { type: string } }
 *                 - type: object
 *                   properties: { data: { type: object, properties: { message: { $ref: '#/components/schemas/Message' } } } }
 *       401:
 *         description: Missing, invalid, or expired access token.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       403:
 *         description: Role is not permitted to mark messages read (ANALYST/VIEWER).
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 *       404:
 *         description: Message does not exist, is deleted, or is not owned by the caller.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } }
 */
router.patch('/:id/read', requireRoles(...MANAGE_ROLES), messageIdParamValidator, validate, messageController.markRead);

module.exports = router;
