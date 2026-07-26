const { validationResult } = require('express-validator');

const { ValidationError } = require('../utils/ApiError');
const { formatValidationErrors } = require('../utils/validationHelpers');

/**
 * Runs after a chain of express-validator checks. Pass the checks first,
 * then this middleware last:
 *
 *   router.post('/thing', [body('name').notEmpty()], validate, controller.create)
 */
function validate(req, _res, next) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    next(new ValidationError(formatValidationErrors(result.array())));
    return;
  }

  next();
}

module.exports = { validate };
