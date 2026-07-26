const { body, query } = require('express-validator');

const { CUSTOMER_STATUS } = require('../constants/customerStatus');
const { mongoIdParam, orderQuery, paginationQuery, searchQuery } = require('./common.validator');

const CUSTOMER_SORT_FIELDS = ['fullName', 'company', 'createdAt', 'updatedAt'];
const MAX_TAGS = 20;

const statusValidator = body('status')
  .optional()
  .isIn(Object.values(CUSTOMER_STATUS))
  .withMessage(`status must be one of: ${Object.values(CUSTOMER_STATUS).join(', ')}.`);

const tagsValidator = [
  body('tags').optional().isArray({ max: MAX_TAGS }).withMessage(`tags must be an array of at most ${MAX_TAGS} items.`),
  body('tags.*').optional().isString().trim().isLength({ max: 40 }),
];

const createCustomerValidator = [
  body('fullName').trim().isLength({ min: 1, max: 160 }).withMessage('fullName must be between 1 and 160 characters.'),
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('phone').optional({ values: 'falsy' }).trim().isLength({ max: 32 }),
  body('company').optional({ values: 'falsy' }).trim().isLength({ max: 160 }),
  body('industry').optional({ values: 'falsy' }).trim().isLength({ max: 120 }),
  body('jobTitle').optional({ values: 'falsy' }).trim().isLength({ max: 120 }),
  body('country').optional({ values: 'falsy' }).trim().isLength({ max: 120 }),
  ...tagsValidator,
  body('notes').optional({ values: 'falsy' }).trim().isLength({ max: 2000 }),
  statusValidator,
];

const updateCustomerValidator = [
  body('fullName').optional().trim().isLength({ min: 1, max: 160 }).withMessage('fullName must be between 1 and 160 characters.'),
  body('email').optional().trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('phone').optional({ values: 'falsy' }).trim().isLength({ max: 32 }),
  body('company').optional({ values: 'falsy' }).trim().isLength({ max: 160 }),
  body('industry').optional({ values: 'falsy' }).trim().isLength({ max: 120 }),
  body('jobTitle').optional({ values: 'falsy' }).trim().isLength({ max: 120 }),
  body('country').optional({ values: 'falsy' }).trim().isLength({ max: 120 }),
  ...tagsValidator,
  body('notes').optional({ values: 'falsy' }).trim().isLength({ max: 2000 }),
  statusValidator,
];

const listCustomersValidator = [
  ...paginationQuery,
  searchQuery,
  orderQuery,
  query('sort').optional().isIn(CUSTOMER_SORT_FIELDS).withMessage(`sort must be one of: ${CUSTOMER_SORT_FIELDS.join(', ')}.`),
  query('status').optional().isIn(Object.values(CUSTOMER_STATUS)),
];

const customerIdParamValidator = [mongoIdParam('id')];

module.exports = { createCustomerValidator, updateCustomerValidator, listCustomersValidator, customerIdParamValidator };
