const { ROLE_HIERARCHY } = require('../constants/roles');
const { AuthenticationError, AuthorizationError } = require('../utils/ApiError');

/** Must run after `authenticate`. Allows only the listed roles. */
function requireRoles(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AuthenticationError());
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AuthorizationError());
      return;
    }

    next();
  };
}

/** Must run after `authenticate`. Allows the given role and every role above it in the hierarchy. */
function requireMinimumRole(minimumRole) {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AuthenticationError());
      return;
    }

    if (ROLE_HIERARCHY[req.user.role] < ROLE_HIERARCHY[minimumRole]) {
      next(new AuthorizationError());
      return;
    }

    next();
  };
}

module.exports = { requireRoles, requireMinimumRole };
