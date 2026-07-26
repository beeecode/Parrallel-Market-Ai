const mongoose = require('mongoose');

const { ApiError, DatabaseError, InternalServerError, ValidationError } = require('./ApiError');

/** Converts any thrown value into an `ApiError`, so the error handler always has a consistent shape. */
function normalizeError(error) {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(error.errors).map((fieldError) => ({
      code: 'VALIDATION_ERROR',
      message: fieldError.message,
      field: fieldError.path,
    }));
    return new ValidationError(errors);
  }

  if (error instanceof mongoose.Error.CastError) {
    return new ValidationError([{ code: 'VALIDATION_ERROR', message: `Invalid value for ${error.path}.`, field: error.path }]);
  }

  if (error && error.code === 11000) {
    return new DatabaseError('A record with these details already exists.');
  }

  return new InternalServerError(error instanceof Error ? error.message : undefined);
}

module.exports = { normalizeError };
