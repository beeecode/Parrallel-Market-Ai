import type { Access, FieldAccess } from 'payload'

import { getAppUser, isStaff } from '../lib/auth'

export const adminOrAnalyst: Access = ({ req }) => isStaff(getAppUser(req))

export const adminOrAnalystField: FieldAccess = ({ req }) => isStaff(getAppUser(req))
