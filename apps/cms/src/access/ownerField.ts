import type { FieldAccess } from 'payload'

import { getAppUser, hasRole, isActiveUser, isAdmin, relationID } from '../lib/auth'

export const ownerManagedField: FieldAccess = ({ data, doc, req }) => {
  const user = getAppUser(req)

  if (!isActiveUser(user)) {
    return false
  }

  if (isAdmin(user)) {
    return true
  }

  if (!hasRole(user, ['business-owner'])) {
    return false
  }

  const ownerID = relationID(doc?.owner ?? data?.owner)
  return ownerID == null || ownerID === user.id
}

export const selfOrAdminField: FieldAccess = ({ doc, req }) => {
  const user = getAppUser(req)

  if (!isActiveUser(user)) {
    return false
  }

  return isAdmin(user) || doc?.id === user.id
}
