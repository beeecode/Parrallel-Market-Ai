const { body, query } = require('express-validator');

const { SIMULATION_DIFFICULTY } = require('../constants/simulationDifficulty');
const { SIMULATION_STATUS } = require('../constants/simulationStatus');
const { SENTIMENT } = require('../constants/sentiment');
const { mongoIdParam, orderQuery, paginationQuery, searchQuery } = require('./common.validator');

const SIMULATION_SORT_FIELDS = ['title', 'status', 'progress', 'createdAt', 'updatedAt'];
const MAX_CONVERSATION_LENGTH = 500;

const configurationValidators = [
  body('configuration.language').optional({ values: 'falsy' }).trim().isLength({ max: 32 }),
  body('configuration.difficulty').optional().isIn(Object.values(SIMULATION_DIFFICULTY)),
  body('configuration.sentiment').optional().isIn(Object.values(SENTIMENT)),
  body('configuration.customerBehavior').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
  body('configuration.temperature').optional().isFloat({ min: 0, max: 1 }).withMessage('configuration.temperature must be between 0 and 1.'),
  body('configuration.conversationLength')
    .optional()
    .isInt({ min: 1, max: MAX_CONVERSATION_LENGTH })
    .withMessage(`configuration.conversationLength must be between 1 and ${MAX_CONVERSATION_LENGTH}.`),
  body('configuration.allowInterruptions').optional().isBoolean(),
];

const createSimulationValidator = [
  body('title').trim().isLength({ min: 1, max: 160 }).withMessage('title must be between 1 and 160 characters.'),
  body('product').isMongoId().withMessage('product must be a valid id.'),
  body('description').optional({ values: 'falsy' }).trim().isLength({ max: 2000 }),
  body('industry').optional({ values: 'falsy' }).trim().isLength({ max: 120 }),
  body('targetAudience').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
  body('objective').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
  body('customerCount').optional().isInt({ min: 0 }).withMessage('customerCount must be a non-negative integer.'),
  body('estimatedDuration').optional().isInt({ min: 0 }).withMessage('estimatedDuration must be a non-negative integer.'),
  ...configurationValidators,
];

const updateSimulationValidator = [
  body('title').optional().trim().isLength({ min: 1, max: 160 }).withMessage('title must be between 1 and 160 characters.'),
  body('description').optional({ values: 'falsy' }).trim().isLength({ max: 2000 }),
  body('industry').optional({ values: 'falsy' }).trim().isLength({ max: 120 }),
  body('targetAudience').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
  body('objective').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
  body('customerCount').optional().isInt({ min: 0 }).withMessage('customerCount must be a non-negative integer.'),
  body('estimatedDuration').optional().isInt({ min: 0 }).withMessage('estimatedDuration must be a non-negative integer.'),
  body('status').optional().isIn(Object.values(SIMULATION_STATUS)).withMessage(`status must be one of: ${Object.values(SIMULATION_STATUS).join(', ')}.`),
  body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('progress must be between 0 and 100.'),
  ...configurationValidators,
];

const listSimulationsValidator = [
  ...paginationQuery,
  searchQuery,
  orderQuery,
  query('sort').optional().isIn(SIMULATION_SORT_FIELDS).withMessage(`sort must be one of: ${SIMULATION_SORT_FIELDS.join(', ')}.`),
  query('status').optional().isIn(Object.values(SIMULATION_STATUS)),
];

const simulationIdParamValidator = [mongoIdParam('id')];

module.exports = { createSimulationValidator, updateSimulationValidator, listSimulationsValidator, simulationIdParamValidator };
