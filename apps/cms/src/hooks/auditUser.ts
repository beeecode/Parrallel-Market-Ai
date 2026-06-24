import type { CollectionBeforeChangeHook } from 'payload'

import { getAppUser, isActiveUser } from '../lib/auth'

export const auditUser: CollectionBeforeChangeHook = ({ data, operation, req }) => {
  const user = getAppUser(req)

  if (!isActiveUser(user)) {
    return data
  }

  if (operation === 'create' && !data.createdBy) {
    data.createdBy = user.id
  }

  data.updatedBy = user.id
  return data
}
