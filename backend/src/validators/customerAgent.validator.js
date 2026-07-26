const { body, query } = require('express-validator');

const { CUSTOMER_AGENT_STATUS } = require('../constants/customerAgentStatus');
const { SENTIMENT } = require('../constants/sentiment');
const { mongoIdParam, orderQuery, paginationQuery, searchQuery } = require('./common.validator');

const CUSTOMER_AGENT_SORT_FIELDS = ['name', 'status', 'createdAt', 'updatedAt'];
const MAX_LIST_ITEMS = 20;

const statusValidator = body('status')
  .optional()
  .isIn(Object.values(CUSTOMER_AGENT_STATUS))
  .withMessage(`status must be one of: ${Object.values(CUSTOMER_AGENT_STATUS).join(', ')}.`);

const sentimentValidator = body('sentiment').optional().isIn(Object.values(SENTIMENT));

const listFieldValidators = (field, max) => [
  body(field).optional().isArray({ max }).withMessage(`${field} must be an array of at most ${max} items.`),
  body(`${field}.*`).optional().isString().trim().isLength({ max: 160 }),
];

const metadataValidators = [
  ...listFieldValidators('metadata.tags', MAX_LIST_ITEMS),
  body('metadata.score').optional().isInt({ min: 0, max: 100 }).withMessage('metadata.score must be between 0 and 100.'),
  body('metadata.notes').optional({ values: 'falsy' }).trim().isLength({ max: 2000 }),
];

const createCustomerAgentValidator = [
  body('simulation').isMongoId().withMessage('simulation must be a valid id.'),
  body('name').trim().isLength({ min: 1, max: 160 }).withMessage('name must be between 1 and 160 characters.'),
  body('avatar').optional({ values: 'falsy' }).trim().isURL().withMessage('avatar must be a valid URL.'),
  body('age').optional().isInt({ min: 0, max: 120 }).withMessage('age must be between 0 and 120.'),
  body('occupation').optional({ values: 'falsy' }).trim().isLength({ max: 160 }),
  body('location').optional({ values: 'falsy' }).trim().isLength({ max: 160 }),
  body('income').optional({ values: 'falsy' }).trim().isLength({ max: 80 }),
  body('personality').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
  ...listFieldValidators('goals', MAX_LIST_ITEMS),
  ...listFieldValidators('painPoints', MAX_LIST_ITEMS),
  body('buyingBehavior').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
  body('communicationStyle').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
  sentimentValidator,
  statusValidator,
  ...metadataValidators,
];

const updateCustomerAgentValidator = [
  body('name').optional().trim().isLength({ min: 1, max: 160 }).withMessage('name must be between 1 and 160 characters.'),
  body('avatar').optional({ values: 'falsy' }).trim().isURL().withMessage('avatar must be a valid URL.'),
  body('age').optional().isInt({ min: 0, max: 120 }).withMessage('age must be between 0 and 120.'),
  body('occupation').optional({ values: 'falsy' }).trim().isLength({ max: 160 }),
  body('location').optional({ values: 'falsy' }).trim().isLength({ max: 160 }),
  body('income').optional({ values: 'falsy' }).trim().isLength({ max: 80 }),
  body('personality').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
  ...listFieldValidators('goals', MAX_LIST_ITEMS),
  ...listFieldValidators('painPoints', MAX_LIST_ITEMS),
  body('buyingBehavior').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
  body('communicationStyle').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
  sentimentValidator,
  statusValidator,
  ...metadataValidators,
];

const listCustomerAgentsValidator = [
  ...paginationQuery,
  searchQuery,
  orderQuery,
  query('sort').optional().isIn(CUSTOMER_AGENT_SORT_FIELDS).withMessage(`sort must be one of: ${CUSTOMER_AGENT_SORT_FIELDS.join(', ')}.`),
  query('status').optional().isIn(Object.values(CUSTOMER_AGENT_STATUS)),
];

const customerAgentIdParamValidator = [mongoIdParam('id')];

module.exports = {
  createCustomerAgentValidator,
  updateCustomerAgentValidator,
  listCustomerAgentsValidator,
  customerAgentIdParamValidator,
};
