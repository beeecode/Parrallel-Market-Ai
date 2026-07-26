const crypto = require('node:crypto');

const jwt = require('jsonwebtoken');

const { jwtConfig } = require('../config/jwt');

/**
 * JWT signing/verification utilities. Not called from any route yet —
 * infrastructure only, ready for the phase that implements login.
 */

function signAccessToken(payload) {
  return jwt.sign({ ...payload, jti: crypto.randomUUID() }, jwtConfig.accessSecret, {
    expiresIn: jwtConfig.accessExpiresIn,
    issuer: jwtConfig.issuer,
  });
}

/**
 * `iat`/`exp` only carry second-precision, so two refresh tokens signed for
 * the same user within the same wall-clock second would otherwise have an
 * identical header + payload + secret and produce a byte-for-byte identical
 * JWT. A random `jti` (JWT ID) guarantees every issued token is unique
 * regardless of timing — required for rotation to be detectable.
 */
function signRefreshToken(payload) {
  return jwt.sign({ ...payload, jti: crypto.randomUUID() }, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
    issuer: jwtConfig.issuer,
  });
}

/** @returns {import('../types/auth.types').JwtAccessPayload} */
function verifyAccessToken(token) {
  return jwt.verify(token, jwtConfig.accessSecret, { issuer: jwtConfig.issuer });
}

/** @returns {import('../types/auth.types').JwtRefreshPayload} */
function verifyRefreshToken(token) {
  return jwt.verify(token, jwtConfig.refreshSecret, { issuer: jwtConfig.issuer });
}

/**
 * For hashing/comparing the refresh token before it's stored on the user —
 * deliberately *not* bcrypt. Bcrypt only considers a password's first 72
 * bytes, and two JWTs for the same user share an identical header + `sub`
 * prefix, so bcrypt would treat a rotated-out token as still matching. A
 * refresh token is a high-entropy random-looking value (unlike a human
 * password), so a fast, fixed-length digest is the correct primitive —
 * compared with `timingSafeEqual` to avoid leaking timing information.
 */
function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function compareRefreshToken(token, hash) {
  const incoming = Buffer.from(hashRefreshToken(token), 'hex');
  const stored = Buffer.from(hash, 'hex');
  return incoming.length === stored.length && crypto.timingSafeEqual(incoming, stored);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashRefreshToken,
  compareRefreshToken,
};
