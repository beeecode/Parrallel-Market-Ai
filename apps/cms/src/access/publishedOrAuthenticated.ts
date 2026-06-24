import type { Access } from 'payload'

import { getAppUser, isActiveUser } from '../lib/auth'

export const publishedOrAuthenticated: Access = ({ req }) => {
  if (isActiveUser(getAppUser(req))) {
    return true
  }

  return {
    status: {
      equals: 'published',
    },
  }
}
