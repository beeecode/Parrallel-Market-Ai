const { body, query } = require('express-validator');

const { PRODUCT_STATUS } = require('../constants/productStatus');
const { mongoIdParam, orderQuery, paginationQuery, searchQuery } = require('./common.validator');

const PRODUCT_SORT_FIELDS = ['name', 'price', 'createdAt', 'updatedAt'];
const MAX_FEATURES = 20;

const statusValidator = body('status')
  .optional()
  .isIn(Object.values(PRODUCT_STATUS))
  .withMessage(`status must be one of: ${Object.values(PRODUCT_STATUS).join(', ')}.`);

const currencyValidator = body('currency')
  .optional({ values: 'falsy' })
  .trim()
  .isLength({ min: 3, max: 3 })
  .withMessage('currency must be a 3-letter code.');

const featuresValidator = [
  body('features').optional().isArray({ max: MAX_FEATURES }).withMessage(`features must be an array of at most ${MAX_FEATURES} items.`),
  body('features.*').optional().isString().trim().isLength({ max: 80 }),
];

const createProductValidator = [
  body('name').trim().isLength({ min: 1, max: 160 }).withMessage('name must be between 1 and 160 characters.'),
  body('description').optional({ values: 'falsy' }).trim().isLength({ max: 2000 }),
  body('category').optional({ values: 'falsy' }).trim().isLength({ max: 120 }),
  body('price').isFloat({ min: 0 }).withMessage('price must be a non-negative number.'),
  currencyValidator,
  statusValidator,
  body('targetAudience').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
  ...featuresValidator,
  body('imageUrl').optional({ values: 'falsy' }).trim().isURL().withMessage('imageUrl must be a valid URL.'),
];

const updateProductValidator = [
  body('name').optional().trim().isLength({ min: 1, max: 160 }).withMessage('name must be between 1 and 160 characters.'),
  body('description').optional({ values: 'falsy' }).trim().isLength({ max: 2000 }),
  body('category').optional({ values: 'falsy' }).trim().isLength({ max: 120 }),
  body('price').optional().isFloat({ min: 0 }).withMessage('price must be a non-negative number.'),
  currencyValidator,
  statusValidator,
  body('targetAudience').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
  ...featuresValidator,
  body('imageUrl').optional({ values: 'falsy' }).trim().isURL().withMessage('imageUrl must be a valid URL.'),
];

const listProductsValidator = [
  ...paginationQuery,
  searchQuery,
  orderQuery,
  query('sort').optional().isIn(PRODUCT_SORT_FIELDS).withMessage(`sort must be one of: ${PRODUCT_SORT_FIELDS.join(', ')}.`),
  query('status').optional().isIn(Object.values(PRODUCT_STATUS)),
];

const productIdParamValidator = [mongoIdParam('id')];

module.exports = { createProductValidator, updateProductValidator, listProductsValidator, productIdParamValidator };
