import type { CollectionConfig } from 'payload'

import {
  adminsOnly,
  relatedSimulationCreate,
  relatedSimulationRead,
  relatedSimulationUpdate,
} from '../access'
import { auditFields } from '../fields'
import { auditUser, validateConversationRelationships } from '../hooks'
import { collectionSlugs } from '../lib/collectionSlugs'

export const Conversations: CollectionConfig = {
  slug: collectionSlugs.conversations,
  labels: {
    singular: 'Conversation',
    plural: 'Conversations',
  },
  admin: {
    group: 'Simulation Operations',
    useAsTitle: 'id',
    defaultColumns: [
      'simulation',
      'customerAgent',
      'status',
      'messageCount',
      'lastMessageAt',
    ],
  },
  access: {
    create: relatedSimulationCreate,
    delete: adminsOnly,
    read: relatedSimulationRead,
    update: relatedSimulationUpdate,
  },
  hooks: {
    beforeValidate: [validateConversationRelationships],
    beforeChange: [auditUser],
  },
  indexes: [
    {
      fields: ['simulation', 'customerAgent'],
    },
    {
      fields: ['simulation', 'status'],
    },
  ],
  fields: [
    {
      name: 'simulation',
      type: 'relationship',
      relationTo: collectionSlugs.simulations,
      required: true,
      index: true,
    },
    {
      name: 'customerAgent',
      type: 'relationship',
      relationTo: collectionSlugs.customerAgents,
      required: true,
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Failed', value: 'failed' },
      ],
      required: true,
    },
    {
      name: 'startedAt',
      type: 'date',
    },
    {
      name: 'endedAt',
      type: 'date',
    },
    {
      name: 'summary',
      type: 'textarea',
      maxLength: 4_000,
    },
    {
      name: 'messageCount',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        readOnly: true,
      },
      access: {
        create: () => false,
        update: () => false,
      },
    },
    {
      name: 'lastMessageAt',
      type: 'date',
      index: true,
      admin: {
        readOnly: true,
      },
      access: {
        create: () => false,
        update: () => false,
      },
    },
    ...auditFields,
  ],
}
