const { body, query } = require('express-validator');

const { CONVERSATION_STATUS } = require('../constants/conversationStatus');
const { mongoIdParam, orderQuery, paginationQuery, searchQuery } = require('./common.validator');

const CONVERSATION_SORT_FIELDS = ['createdAt', 'updatedAt', 'lastActivity', 'messageCount'];
// "Archived" is only ever set via the dedicated archive/restore endpoints,
// never accepted on the general update endpoint.
const CLIENT_SETTABLE_STATUSES = [CONVERSATION_STATUS.OPEN, CONVERSATION_STATUS.CLOSED];
const MAX_TAGS = 20;

const metadataValidators = [
  body('metadata.tags').optional().isArray({ max: MAX_TAGS }).withMessage(`metadata.tags must be an array of at most ${MAX_TAGS} items.`),
  body('metadata.tags.*').optional().isString().trim().isLength({ max: 80 }),
  body('metadata.source').optional({ values: 'falsy' }).trim().isLength({ max: 160 }),
  body('metadata.notes').optional({ values: 'falsy' }).trim().isLength({ max: 2000 }),
];

const createConversationValidator = [
  body('customerAgent').isMongoId().withMessage('customerAgent must be a valid id.'),
  body('title').trim().isLength({ min: 1, max: 160 }).withMessage('title must be between 1 and 160 characters.'),
  ...metadataValidators,
];

const updateConversationValidator = [
  body('title').optional().trim().isLength({ min: 1, max: 160 }).withMessage('title must be between 1 and 160 characters.'),
  body('status').optional().isIn(CLIENT_SETTABLE_STATUSES).withMessage(`status must be one of: ${CLIENT_SETTABLE_STATUSES.join(', ')}.`),
  ...metadataValidators,
];

const listConversationsValidator = [
  ...paginationQuery,
  searchQuery,
  orderQuery,
  query('sort').optional().isIn(CONVERSATION_SORT_FIELDS).withMessage(`sort must be one of: ${CONVERSATION_SORT_FIELDS.join(', ')}.`),
  query('status').optional().isIn(Object.values(CONVERSATION_STATUS)),
  query('simulation').optional().isMongoId(),
  query('customerAgent').optional().isMongoId(),
];

const conversationIdParamValidator = [mongoIdParam('id')];

module.exports = { createConversationValidator, updateConversationValidator, listConversationsValidator, conversationIdParamValidator };
