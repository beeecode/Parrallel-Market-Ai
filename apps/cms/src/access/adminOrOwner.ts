import type { Access } from 'payload'

import { getAppUser, isActiveUser, isAdmin } from '../lib/auth'

export const adminOrOwner = (ownerField = 'owner'): Access => ({ req }) => {
  const user = getAppUser(req)

  if (!isActiveUser(user)) {
    return false
  }

  if (isAdmin(user)) {
    return true
  }

  return {
    [ownerField]: {
      equals: user.id,
    },
  }
}

export const ownerRead = adminOrOwner
export const ownerUpdate = adminOrOwner
