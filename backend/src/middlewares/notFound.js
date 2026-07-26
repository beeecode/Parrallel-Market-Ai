const { NotFoundError } = require('../utils/ApiError');

function notFound(req, _res, next) {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
}

module.exports = { notFound };
