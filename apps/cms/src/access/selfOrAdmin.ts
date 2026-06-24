import type { Access } from 'payload'

import { getAppUser, isActiveUser, isAdmin } from '../lib/auth'

export const selfOrAdmin: Access = ({ req }) => {
  const user = getAppUser(req)

  if (!isActiveUser(user)) {
    return false
  }

  if (isAdmin(user)) {
    return true
  }

  return {
    id: {
      equals: user.id,
    },
  }
}
