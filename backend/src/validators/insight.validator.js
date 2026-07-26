const { query } = require('express-validator');

const { INSIGHT_IMPORTANCE } = require('../constants/insightImportance');
const { INSIGHT_TREND } = require('../constants/insightTrend');
const { mongoIdParam, orderQuery, paginationQuery, searchQuery } = require('./common.validator');

const INSIGHT_SORT_FIELDS = ['title', 'importance', 'score', 'createdAt', 'updatedAt'];

const listInsightsValidator = [
  ...paginationQuery,
  searchQuery,
  orderQuery,
  query('sort').optional().isIn(INSIGHT_SORT_FIELDS).withMessage(`sort must be one of: ${INSIGHT_SORT_FIELDS.join(', ')}.`),
  query('importance').optional().isIn(Object.values(INSIGHT_IMPORTANCE)),
  query('trend').optional().isIn(Object.values(INSIGHT_TREND)),
];

const insightIdParamValidator = [mongoIdParam('id')];

module.exports = { listInsightsValidator, insightIdParamValidator };
