import type { CollectionConfig } from 'payload'

import {
  adminsOnly,
  adminsOnlyField,
  authenticated,
  selfOrAdmin,
  selfOrAdminField,
} from '../access'
import { preventInactiveLogin, recordLastLogin } from '../hooks'
import { collectionSlugs } from '../lib/collectionSlugs'
import { userRoles } from '../lib/roles'
import { requiredText } from '../lib/validation'

export const Users: CollectionConfig = {
  slug: collectionSlugs.users,
  labels: {
    singular: 'User',
    plural: 'Users',
  },
  admin: {
    group: 'Administration',
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role', 'company', 'isActive'],
  },
  auth: true,
  access: {
    admin: ({ req }) => Boolean(authenticated({ req })),
    create: adminsOnly,
    delete: adminsOnly,
    read: selfOrAdmin,
    update: selfOrAdmin,
  },
  hooks: {
    beforeLogin: [preventInactiveLogin],
    afterLogin: [recordLastLogin],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      validate: requiredText('Name', 160),
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'business-owner',
      index: true,
      options: userRoles,
      required: true,
      access: {
        create: adminsOnlyField,
        update: adminsOnlyField,
      },
    },
    {
      name: 'company',
      type: 'text',
      access: {
        update: selfOrAdminField,
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: collectionSlugs.media,
      access: {
        update: selfOrAdminField,
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      index: true,
      access: {
        create: adminsOnlyField,
        update: adminsOnlyField,
      },
    },
    {
      name: 'lastLoginAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
      access: {
        create: () => false,
        update: () => false,
      },
    },
  ],
}
