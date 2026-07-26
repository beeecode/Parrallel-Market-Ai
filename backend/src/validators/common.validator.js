const { param, query } = require('express-validator');

/** Generic, reusable validation chains — not tied to any specific resource. */

const mongoIdParam = (paramName = 'id') => param(paramName).isMongoId().withMessage(`${paramName} must be a valid id.`);

const paginationQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100.'),
];

const searchQuery = query('search')
  .optional()
  .trim()
  .isLength({ max: 160 })
  .withMessage('search must be at most 160 characters.');

const orderQuery = query('order').optional().isIn(['asc', 'desc']).withMessage('order must be "asc" or "desc".');

module.exports = { mongoIdParam, paginationQuery, searchQuery, orderQuery };
