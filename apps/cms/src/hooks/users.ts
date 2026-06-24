import { APIError } from 'payload'
import type { CollectionAfterLoginHook, CollectionBeforeLoginHook } from 'payload'

import { collectionSlugs } from '../lib/collectionSlugs'

type LoginUser = {
  id: number | string
  isActive?: boolean | null
}

export const preventInactiveLogin: CollectionBeforeLoginHook<LoginUser> = ({ user }) => {
  if (user.isActive === false) {
    throw new APIError('This account is inactive.', 403)
  }

  return user
}

export const recordLastLogin: CollectionAfterLoginHook<LoginUser> = async ({ req, user }) => {
  await req.payload.update({
    collection: collectionSlugs.users,
    id: user.id,
    data: {
      lastLoginAt: new Date().toISOString(),
    },
    overrideAccess: true,
    req,
  })
}
