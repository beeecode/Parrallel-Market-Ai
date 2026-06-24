import type { CollectionBeforeChangeHook } from 'payload'

import { getAppUser, isActiveUser, isAdmin, relationID } from '../lib/auth'

export const assignOwner = (fieldName = 'owner'): CollectionBeforeChangeHook => ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  const user = getAppUser(req)

  if (!isActiveUser(user)) {
    return data
  }

  if (operation === 'create' && (!data[fieldName] || !isAdmin(user))) {
    data[fieldName] = user.id
  }

  if (
    operation === 'update' &&
    !isAdmin(user) &&
    originalDoc &&
    relationID(data[fieldName]) !== null &&
    relationID(data[fieldName]) !== relationID(originalDoc[fieldName])
  ) {
    data[fieldName] = originalDoc[fieldName]
  }

  return data
}
