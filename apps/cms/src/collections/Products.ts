import type { CollectionConfig } from 'payload'

import {
  adminsOnly,
  authenticatedField,
  businessOwnerOrAdmin,
  ownerManagedField,
  staffOrOwner,
} from '../access'
import { auditFields, currencyField, slugField } from '../fields'
import { assignOwner, auditUser, generateSlug } from '../hooks'
import { collectionSlugs } from '../lib/collectionSlugs'
import { nonNegativeNumber, requiredText } from '../lib/validation'

export const Products: CollectionConfig = {
  slug: collectionSlugs.products,
  labels: {
    singular: 'Product',
    plural: 'Products',
  },
  admin: {
    group: 'Market Research',
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'owner', 'currentPrice', 'currency', 'status'],
  },
  access: {
    create: businessOwnerOrAdmin,
    delete: adminsOnly,
    read: staffOrOwner(),
    update: staffOrOwner(),
  },
  hooks: {
    beforeValidate: [generateSlug('name')],
    beforeChange: [assignOwner(), auditUser],
  },
  indexes: [
    {
      fields: ['owner', 'status'],
    },
  ],
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: collectionSlugs.users,
      required: true,
      index: true,
      access: {
        create: authenticatedField,
        update: ({ req }) => req.user?.role === 'admin',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      validate: requiredText('Product name', 180),
      access: {
        update: ownerManagedField,
      },
    },
    slugField({
      access: {
        update: ownerManagedField,
      },
    }),
    {
      name: 'category',
      type: 'text',
      required: true,
      validate: requiredText('Category', 120),
      access: {
        update: ownerManagedField,
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      maxLength: 4_000,
      validate: requiredText('Description', 4_000),
      access: {
        update: ownerManagedField,
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: collectionSlugs.media,
      access: {
        update: ownerManagedField,
      },
    },
    {
      name: 'currentPrice',
      type: 'number',
      min: 0,
      required: true,
      validate: nonNegativeNumber('Current price'),
      access: {
        update: ownerManagedField,
      },
    },
    currencyField({
      access: {
        update: ownerManagedField,
      },
    }),
    {
      name: 'targetMarket',
      type: 'text',
      required: true,
      validate: requiredText('Target market', 240),
      access: {
        update: ownerManagedField,
      },
    },
    {
      name: 'targetLocation',
      type: 'text',
      required: true,
      validate: requiredText('Target location', 240),
      access: {
        update: ownerManagedField,
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Archived', value: 'archived' },
      ],
      required: true,
      access: {
        update: ownerManagedField,
      },
    },
    ...auditFields,
  ],
}
