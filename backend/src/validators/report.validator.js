const { body, query } = require('express-validator');

const { REPORT_STATUS } = require('../constants/reportStatus');
const { mongoIdParam, orderQuery, paginationQuery, searchQuery } = require('./common.validator');

const REPORT_SORT_FIELDS = ['title', 'status', 'createdAt', 'generatedAt', 'conversionScore', 'engagementScore'];

const generateReportValidator = [
  body('simulation').isMongoId().withMessage('simulation must be a valid id.'),
  body('title').optional({ values: 'falsy' }).trim().isLength({ max: 160 }),
  body('description').optional({ values: 'falsy' }).trim().isLength({ max: 2000 }),
];

const updateReportValidator = [
  body('title').optional().trim().isLength({ min: 1, max: 160 }).withMessage('title must be between 1 and 160 characters.'),
  body('description').optional({ values: 'falsy' }).trim().isLength({ max: 2000 }),
  body('summary').optional({ values: 'falsy' }).trim().isLength({ max: 1000 }),
];

const listReportsValidator = [
  ...paginationQuery,
  searchQuery,
  orderQuery,
  query('sort').optional().isIn(REPORT_SORT_FIELDS).withMessage(`sort must be one of: ${REPORT_SORT_FIELDS.join(', ')}.`),
  query('status').optional().isIn(Object.values(REPORT_STATUS)),
];

const reportIdParamValidator = [mongoIdParam('id')];

module.exports = { generateReportValidator, updateReportValidator, listReportsValidator, reportIdParamValidator };
