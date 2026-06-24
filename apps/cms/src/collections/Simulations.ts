import type { CollectionConfig } from 'payload'

import {
  adminOrAnalystField,
  adminsOnly,
  authenticatedField,
  businessOwnerOrAdmin,
  ownerManagedField,
  staffOrOwner,
} from '../access'
import { auditFields, currencyField } from '../fields'
import { assignOwner, auditUser, validateSimulation } from '../hooks'
import { collectionSlugs } from '../lib/collectionSlugs'
import {
  nonNegativeNumber,
  percentage,
  positiveInteger,
  requiredText,
} from '../lib/validation'

export const Simulations: CollectionConfig = {
  slug: collectionSlugs.simulations,
  labels: {
    singular: 'Simulation',
    plural: 'Simulations',
  },
  admin: {
    group: 'Simulation Operations',
    useAsTitle: 'title',
    defaultColumns: [
      'title',
      'product',
      'owner',
      'status',
      'customerCount',
      'successProbability',
      'updatedAt',
    ],
  },
  access: {
    create: businessOwnerOrAdmin,
    delete: adminsOnly,
    read: staffOrOwner(),
    update: staffOrOwner(),
  },
  hooks: {
    beforeValidate: [validateSimulation],
    beforeChange: [assignOwner(), auditUser],
  },
  indexes: [
    {
      fields: ['owner', 'status'],
    },
    {
      fields: ['product', 'status'],
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
      name: 'product',
      type: 'relationship',
      relationTo: collectionSlugs.products,
      required: true,
      index: true,
      access: {
        update: ownerManagedField,
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      validate: requiredText('Simulation title', 200),
      access: {
        update: ownerManagedField,
      },
    },
    {
      name: 'targetAudience',
      type: 'textarea',
      required: true,
      maxLength: 2_000,
      validate: requiredText('Target audience', 2_000),
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
      name: 'customerCount',
      type: 'number',
      min: 1,
      required: true,
      validate: positiveInteger('Customer count'),
      access: {
        update: ownerManagedField,
      },
    },
    {
      name: 'conversationCount',
      type: 'number',
      defaultValue: 0,
      min: 0,
      required: true,
      admin: {
        description:
          'Aggregate conversation count used by dashboard reporting. Editable only by analysts and administrators.',
        readOnly: true,
      },
      access: {
        create: adminOrAnalystField,
        update: adminOrAnalystField,
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Queued', value: 'queued' },
        { label: 'Running', value: 'running' },
        { label: 'Paused', value: 'paused' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
      ],
      required: true,
      access: {
        update: ownerManagedField,
      },
    },
    {
      name: 'successProbability',
      type: 'number',
      min: 0,
      max: 100,
      validate: percentage('Success probability'),
      admin: {
        description: 'Calculated analysis field. Editable only by analysts and administrators.',
      },
      access: {
        create: adminOrAnalystField,
        update: adminOrAnalystField,
      },
    },
    {
      name: 'purchaseRate',
      type: 'number',
      min: 0,
      max: 100,
      validate: percentage('Purchase rate'),
      access: {
        create: adminOrAnalystField,
        update: adminOrAnalystField,
      },
    },
    {
      name: 'repeatRate',
      type: 'number',
      min: 0,
      max: 100,
      validate: percentage('Repeat rate'),
      access: {
        create: adminOrAnalystField,
        update: adminOrAnalystField,
      },
    },
    {
      name: 'revenueMinimum',
      type: 'number',
      min: 0,
      validate: nonNegativeNumber('Minimum revenue'),
      access: {
        create: adminOrAnalystField,
        update: adminOrAnalystField,
      },
    },
    {
      name: 'revenueMaximum',
      type: 'number',
      min: 0,
      validate: nonNegativeNumber('Maximum revenue'),
      access: {
        create: adminOrAnalystField,
        update: adminOrAnalystField,
      },
    },
    currencyField(),
    {
      name: 'startedAt',
      type: 'date',
      access: {
        update: ownerManagedField,
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      access: {
        update: ownerManagedField,
      },
    },
    {
      name: 'configuration',
      type: 'group',
      access: {
        update: ownerManagedField,
      },
      fields: [
        { name: 'simulationGoal', type: 'textarea', maxLength: 2_000 },
        { name: 'marketConditions', type: 'textarea', maxLength: 2_000 },
        { name: 'pricingStrategy', type: 'textarea', maxLength: 2_000 },
        {
          name: 'customerSegments',
          type: 'array',
          fields: [{ name: 'segment', type: 'text', required: true }],
        },
        { name: 'competitorContext', type: 'textarea', maxLength: 2_000 },
        { name: 'additionalInstructions', type: 'textarea', maxLength: 4_000 },
      ],
    },
    {
      name: 'failureReason',
      type: 'textarea',
      maxLength: 2_000,
      access: {
        create: adminOrAnalystField,
        update: adminOrAnalystField,
      },
    },
    ...auditFields,
  ],
}
