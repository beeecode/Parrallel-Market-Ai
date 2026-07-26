const { ROLES } = require('../constants/roles');

/** Handles both a populated reference (sub-document) and a bare ObjectId/string reference. */
function resolveRefId(resource, field = 'owner') {
  const value = resource[field];
  return (value && value._id ? value._id : value).toString();
}

function resolveOwnerId(resource) {
  return resolveRefId(resource, 'owner');
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

module.exports = { resolveRefId, resolveOwnerId, scopeToOwnerIfNeeded, canAccessResource };
