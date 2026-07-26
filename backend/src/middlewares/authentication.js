const { verifyAccessToken } = require('../services/token.service');
const { AuthenticationError } = require('../utils/ApiError');

const BEARER_PREFIX = 'Bearer ';

/**
 * Rejects the request unless a valid access token is present.
 * Not applied to any route yet — infrastructure only.
 */
function authenticate(req, _res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith(BEARER_PREFIX)) {
    next(new AuthenticationError('Missing or malformed Authorization header.'));
    return;
  }

  try {
    req.user = verifyAccessToken(header.slice(BEARER_PREFIX.length));
    next();
  } catch {
    next(new AuthenticationError('Invalid or expired access token.'));
  }
}

/** Attaches the current user when a valid token is present, but never rejects the request. */
function attachCurrentUser(req, _res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith(BEARER_PREFIX)) {
    next();
    return;
  }

  try {
    req.user = verifyAccessToken(header.slice(BEARER_PREFIX.length));
  } catch {
    // An invalid or expired token on an optional-auth route is treated as anonymous.
  }

  next();
}

module.exports = { authenticate, attachCurrentUser };
