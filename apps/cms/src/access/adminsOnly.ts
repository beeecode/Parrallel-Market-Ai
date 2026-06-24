import type { Access, FieldAccess } from 'payload'

import { getAppUser, isAdmin } from '../lib/auth'

export const adminsOnly: Access = ({ req }) => isAdmin(getAppUser(req))

export const adminsOnlyField: FieldAccess = ({ req }) => isAdmin(getAppUser(req))
