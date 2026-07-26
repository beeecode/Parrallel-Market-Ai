const { ROLES } = require('../constants/roles');

/** Handles both a populated owner (sub-document) and a bare ObjectId/string reference. */
function resolveOwnerId(resource) {
  const owner = resource.owner;
  return (owner && owner._id ? owner._id : owner).toString();
}

/**
 * BUSINESS_OWNER only ever lists their own records; every other authenticated
 * role (ADMIN, ANALYST, VIEWER) reads across all owners.
 */
function scopeToOwnerIfNeeded(filters, user) {
  if (user.role === ROLES.BUSINESS_OWNER) {
    filters.owner = user.sub;
  }
  return filters;
}

/**
 * True when `user` may read or write a specific resource: ADMIN has
 * unrestricted access, ANALYST/VIEWER have unrestricted *read* access (the
 * only access they're ever routed to — write routes 403 them before this
 * runs), and BUSINESS_OWNER is confined to resources they own.
 */
function canAccessResource(resource, user) {
  if (user.role === ROLES.BUSINESS_OWNER) {
    return resolveOwnerId(resource) === user.sub;
  }
  return true;
}

module.exports = { resolveOwnerId, scopeToOwnerIfNeeded, canAccessResource };
