import type { Access, FieldAccess } from 'payload'

import { getAppUser, isActiveUser } from '../lib/auth'

export const authenticated: Access = ({ req }) => isActiveUser(getAppUser(req))

export const authenticatedField: FieldAccess = ({ req }) => isActiveUser(getAppUser(req))
