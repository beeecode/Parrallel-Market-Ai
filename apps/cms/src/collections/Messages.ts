import type { CollectionConfig } from 'payload'

import {
  adminOrAnalystField,
  adminsOnly,
  relatedSimulationCreate,
  relatedSimulationRead,
  staffRelatedSimulationUpdate,
} from '../access'
import { auditFields } from '../fields'
import {
  auditUser,
  protectMessageSender,
  updateConversationMetadata,
  validateMessageRelationships,
} from '../hooks'
import { collectionSlugs } from '../lib/collectionSlugs'
import { messageContent } from '../lib/validation'

export const Messages: CollectionConfig = {
  slug: collectionSlugs.messages,
  labels: {
    singular: 'Message',
    plural: 'Messages',
  },
  defaultSort: 'sentAt',
  admin: {
    group: 'Simulation Operations',
    useAsTitle: 'content',
    defaultColumns: ['content', 'senderType', 'conversation', 'sentiment', 'sentAt'],
  },
  access: {
    create: relatedSimulationCreate,
    delete: adminsOnly,
    read: relatedSimulationRead,
    update: staffRelatedSimulationUpdate,
  },
  hooks: {
    beforeValidate: [protectMessageSender, validateMessageRelationships],
    beforeChange: [auditUser],
    afterChange: [updateConversationMetadata],
  },
  indexes: [
    {
      fields: ['conversation', 'sentAt'],
    },
    {
      fields: ['simulation', 'sentAt'],
    },
  ],
  fields: [
    {
      name: 'conversation',
      type: 'relationship',
      relationTo: collectionSlugs.conversations,
      required: true,
      index: true,
    },
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
      index: true,
    },
    {
      name: 'senderType',
      type: 'select',
      options: [
        { label: 'Customer', value: 'customer' },
        { label: 'Business', value: 'business' },
        { label: 'System', value: 'system' },
      ],
      required: true,
    },
    {
      name: 'content',
      type: 'textarea',
      maxLength: 4_000,
      required: true,
      validate: messageContent,
    },
    {
      name: 'sentiment',
      type: 'select',
      defaultValue: 'unknown',
      options: [
        { label: 'Positive', value: 'positive' },
        { label: 'Neutral', value: 'neutral' },
        { label: 'Negative', value: 'negative' },
        { label: 'Mixed', value: 'mixed' },
        { label: 'Unknown', value: 'unknown' },
      ],
      access: {
        create: adminOrAnalystField,
        update: adminOrAnalystField,
      },
    },
    {
      name: 'buyingIntent',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Converted', value: 'converted' },
      ],
      access: {
        create: adminOrAnalystField,
        update: adminOrAnalystField,
      },
    },
    {
      name: 'objectionCategory',
      type: 'text',
      maxLength: 160,
      access: {
        create: adminOrAnalystField,
        update: adminOrAnalystField,
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Internal structured analysis metadata.',
      },
      access: {
        create: adminOrAnalystField,
        update: adminOrAnalystField,
      },
    },
    {
      name: 'sentAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      index: true,
      required: true,
    },
    ...auditFields,
  ],
}
