const { ERROR_CODES } = require('../constants/errorCodes');

/**
 * Maps express-validator's `Result.array()` output into the project's
 * standard `ApiErrorItem[]` shape.
 */
function formatValidationErrors(validationErrorArray) {
  return validationErrorArray.map((error) => ({
    code: ERROR_CODES.VALIDATION_ERROR,
    message: error.msg,
    field: error.path,
  }));
}

module.exports = { formatValidationErrors };
