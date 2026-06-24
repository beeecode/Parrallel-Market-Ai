import type { Access, FieldAccess } from 'payload'

import { getAppUser, hasRole } from '../lib/auth'

export const businessOwnerOrAdmin: Access = ({ req }) =>
  hasRole(getAppUser(req), ['admin', 'business-owner'])

export const businessOwnerOrAdminField: FieldAccess = ({ req }) =>
  hasRole(getAppUser(req), ['admin', 'business-owner'])
