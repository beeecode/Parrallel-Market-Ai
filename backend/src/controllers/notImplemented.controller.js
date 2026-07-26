const { NotImplementedError } = require('../utils/ApiError');

function notImplemented(_req, _res, next) {
  next(new NotImplementedError());
}

module.exports = { notImplemented };
