/**
 * @typedef {Object} JwtAccessPayload
 * @property {string} sub - User id.
 * @property {string} email
 * @property {'ADMIN'|'BUSINESS_OWNER'|'ANALYST'|'VIEWER'} role
 *
 * @typedef {Object} JwtRefreshPayload
 * @property {string} sub - User id.
 * @property {number} tokenVersion
 */

module.exports = {};
