const { body, query } = require('express-validator');

const { MESSAGE_SENDER_TYPE } = require('../constants/messageSenderType');
const { MESSAGE_TYPE } = require('../constants/messageType');
const { mongoIdParam, orderQuery, paginationQuery, searchQuery } = require('./common.validator');

const MESSAGE_SORT_FIELDS = ['createdAt', 'updatedAt'];
const MAX_ATTACHMENTS = 10;
const MAX_CONTENT_LENGTH = 5000;

const attachmentsValidators = [
  body('attachments').optional().isArray({ max: MAX_ATTACHMENTS }).withMessage(`attachments must be an array of at most ${MAX_ATTACHMENTS} items.`),
  body('attachments.*.name').optional().isString().trim().isLength({ min: 1, max: 255 }),
  body('attachments.*.url').optional().isURL().withMessage('attachments.*.url must be a valid URL.'),
  body('attachments.*.mimeType').optional({ values: 'falsy' }).isString().trim().isLength({ max: 120 }),
  body('attachments.*.size').optional().isInt({ min: 0 }).withMessage('attachments.*.size must be a non-negative integer.'),
];

const metadataValidators = [
  body('metadata.tags').optional().isArray(),
  body('metadata.tags.*').optional().isString().trim().isLength({ max: 80 }),
  body('metadata.source').optional({ values: 'falsy' }).trim().isLength({ max: 160 }),
  body('metadata.notes').optional({ values: 'falsy' }).trim().isLength({ max: 2000 }),
];

const sendMessageValidator = [
  body('conversation').isMongoId().withMessage('conversation must be a valid id.'),
  body('senderType').isIn(Object.values(MESSAGE_SENDER_TYPE)).withMessage(`senderType must be one of: ${Object.values(MESSAGE_SENDER_TYPE).join(', ')}.`),
  body('content').trim().isLength({ min: 1, max: MAX_CONTENT_LENGTH }).withMessage(`content must be between 1 and ${MAX_CONTENT_LENGTH} characters.`),
  body('type').optional().isIn(Object.values(MESSAGE_TYPE)),
  ...attachmentsValidators,
  ...metadataValidators,
];

const updateMessageValidator = [
  body('content').optional().trim().isLength({ min: 1, max: MAX_CONTENT_LENGTH }).withMessage(`content must be between 1 and ${MAX_CONTENT_LENGTH} characters.`),
  ...attachmentsValidators,
  ...metadataValidators,
];

const listMessagesValidator = [
  ...paginationQuery,
  searchQuery,
  orderQuery,
  query('sort').optional().isIn(MESSAGE_SORT_FIELDS).withMessage(`sort must be one of: ${MESSAGE_SORT_FIELDS.join(', ')}.`),
];

const messageIdParamValidator = [mongoIdParam('id')];

module.exports = { sendMessageValidator, updateMessageValidator, listMessagesValidator, messageIdParamValidator };
