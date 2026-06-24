import type { Access } from 'payload'

import { getAppUser, hasRole, isActiveUser, isStaff } from '../lib/auth'

export const staffOrOwner = (ownerField = 'owner'): Access => ({ req }) => {
  const user = getAppUser(req)

  if (!isActiveUser(user)) {
    return false
  }

  if (isStaff(user)) {
    return true
  }

  if (!hasRole(user, ['business-owner'])) {
    return false
  }

  return {
    [ownerField]: {
      equals: user.id,
    },
  }
}
