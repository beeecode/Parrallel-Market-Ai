const { ERROR_CODES } = require('../constants/errorCodes');
const { HTTP_STATUS } = require('../constants/httpStatus');

class ApiError extends Error {
  /**
   * @param {Object} params
   * @param {string} params.message
   * @param {number} params.statusCode
   * @param {string} params.code
   * @param {import('../types/common.types').ApiErrorItem[]} [params.errors]
   * @param {boolean} [params.isOperational] - false marks unexpected/internal failures.
   */
  constructor({ message, statusCode, code, errors, isOperational = true }) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    // Every error response self-describes in `errors[]`, even single-cause
    // ones (NotFound, Authentication, ...) — callers can always rely on it
    // instead of sometimes reading `message` and sometimes `errors[0]`.
    this.errors = errors ?? [{ code, message }];
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends ApiError {
  constructor(errors) {
    super({ message: 'Validation failed.', statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY, code: ERROR_CODES.VALIDATION_ERROR, errors });
  }
}

class AuthenticationError extends ApiError {
  constructor(message = 'Authentication is required.') {
    super({ message, statusCode: HTTP_STATUS.UNAUTHORIZED, code: ERROR_CODES.AUTHENTICATION_ERROR });
  }
}

class AuthorizationError extends ApiError {
  constructor(message = 'You do not have permission to perform this action.') {
    super({ message, statusCode: HTTP_STATUS.FORBIDDEN, code: ERROR_CODES.AUTHORIZATION_ERROR });
  }
}

class NotFoundError extends ApiError {
  constructor(message = 'The requested resource was not found.') {
    super({ message, statusCode: HTTP_STATUS.NOT_FOUND, code: ERROR_CODES.NOT_FOUND });
  }
}

class ConflictError extends ApiError {
  constructor(message = 'The request could not be completed due to a conflict.') {
    super({ message, statusCode: HTTP_STATUS.CONFLICT, code: ERROR_CODES.CONFLICT });
  }
}

class NotImplementedError extends ApiError {
  constructor(message = 'This endpoint has not been implemented yet.') {
    super({ message, statusCode: HTTP_STATUS.NOT_IMPLEMENTED, code: ERROR_CODES.NOT_IMPLEMENTED });
  }
}

class DatabaseError extends ApiError {
  constructor(message = 'A database error occurred.') {
    super({ message, statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR, code: ERROR_CODES.DATABASE_ERROR, isOperational: false });
  }
}

class InternalServerError extends ApiError {
  constructor(message = 'An unexpected error occurred.') {
    super({ message, statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR, code: ERROR_CODES.INTERNAL_SERVER_ERROR, isOperational: false });
  }
}

module.exports = {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  NotImplementedError,
  DatabaseError,
  InternalServerError,
};
