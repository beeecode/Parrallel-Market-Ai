import { APIError } from 'payload'
import type { CollectionBeforeValidateHook } from 'payload'

import { getAppUser, hasRole } from '../lib/auth'

export const protectMessageSender: CollectionBeforeValidateHook = ({ context, data, req }) => {
  if (!data || context.seed) {
    return data
  }

  const user = getAppUser(req)
  if (hasRole(user, ['business-owner']) && data.senderType !== 'business') {
    throw new APIError('Business owners may only create business messages.', 403)
  }

  return data
}
