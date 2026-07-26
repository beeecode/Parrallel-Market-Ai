const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  BUSINESS_OWNER: 'BUSINESS_OWNER',
  ANALYST: 'ANALYST',
  VIEWER: 'VIEWER',
});

/** Higher value outranks lower value in `requireMinimumRole` checks. */
const ROLE_HIERARCHY = Object.freeze({
  [ROLES.VIEWER]: 1,
  [ROLES.ANALYST]: 2,
  [ROLES.BUSINESS_OWNER]: 3,
  [ROLES.ADMIN]: 4,
});

module.exports = { ROLES, ROLE_HIERARCHY };
