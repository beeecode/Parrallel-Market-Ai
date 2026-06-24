import type { CollectionConfig } from 'payload'

import {
  adminOrAnalyst,
  adminOrAnalystField,
  adminsOnly,
  publicCreateOnly,
} from '../access'
import { currencyField } from '../fields'
import { sanitizeRequest, setSubmittedAt } from '../hooks'
import { collectionSlugs } from '../lib/collectionSlugs'
import { requestTextLimits } from '../lib/constants'
import {
  emailField,
  nonNegativeNumber,
  requiredText,
} from '../lib/validation'

export const CustomSimulationRequests: CollectionConfig = {
  slug: collectionSlugs.customSimulationRequests,
  labels: {
    singular: 'Custom Simulation Request',
    plural: 'Custom Simulation Requests',
  },
  admin: {
    group: 'Market Research',
    useAsTitle: 'productName',
    defaultColumns: [
      'productName',
      'customerName',
      'company',
      'status',
      'assignedTo',
      'submittedAt',
    ],
  },
  access: {
    create: publicCreateOnly,
    delete: adminsOnly,
    read: adminOrAnalyst,
    update: adminOrAnalyst,
  },
  hooks: {
    beforeValidate: [sanitizeRequest],
    beforeChange: [setSubmittedAt],
  },
  indexes: [
    {
      fields: ['status', 'submittedAt'],
    },
    {
      fields: ['email', 'submittedAt'],
    },
  ],
  fields: [
    {
      name: 'customerName',
      type: 'text',
      required: true,
      maxLength: requestTextLimits.short,
      validate: requiredText('Customer name', requestTextLimits.short),
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      index: true,
      validate: emailField,
    },
    {
      name: 'company',
      type: 'text',
      required: true,
      maxLength: requestTextLimits.short,
      validate: requiredText('Company', requestTextLimits.short),
    },
    {
      name: 'businessType',
      type: 'text',
      required: true,
      maxLength: requestTextLimits.short,
      validate: requiredText('Business type', requestTextLimits.short),
    },
    {
      name: 'productName',
      type: 'text',
      required: true,
      maxLength: requestTextLimits.short,
      validate: requiredText('Product name', requestTextLimits.short),
    },
    {
      name: 'productDescription',
      type: 'textarea',
      required: true,
      maxLength: requestTextLimits.long,
      validate: requiredText('Product description', requestTextLimits.long),
    },
    {
      name: 'targetMarket',
      type: 'text',
      required: true,
      maxLength: requestTextLimits.medium,
      validate: requiredText('Target market', requestTextLimits.medium),
    },
    {
      name: 'targetLocation',
      type: 'text',
      required: true,
      maxLength: requestTextLimits.medium,
      validate: requiredText('Target location', requestTextLimits.medium),
    },
    {
      name: 'targetCustomers',
      type: 'textarea',
      required: true,
      maxLength: requestTextLimits.medium,
      validate: requiredText('Target customers', requestTextLimits.medium),
    },
    {
      name: 'currentPrice',
      type: 'number',
      min: 0,
      validate: nonNegativeNumber('Current price'),
    },
    currencyField(),
    {
      name: 'businessChallenge',
      type: 'textarea',
      required: true,
      maxLength: requestTextLimits.long,
      validate: requiredText('Business challenge', requestTextLimits.long),
    },
    {
      name: 'simulationGoal',
      type: 'textarea',
      required: true,
      maxLength: requestTextLimits.long,
      validate: requiredText('Simulation goal', requestTextLimits.long),
    },
    {
      name: 'budget',
      type: 'number',
      min: 0,
      validate: nonNegativeNumber('Budget'),
    },
    {
      name: 'timeline',
      type: 'text',
      required: true,
      maxLength: requestTextLimits.medium,
      validate: requiredText('Timeline', requestTextLimits.medium),
    },
    {
      name: 'conversationSummary',
      type: 'textarea',
      maxLength: requestTextLimits.long,
      admin: {
        description: 'Structured summary of the deterministic request flow. Not AI generated.',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      index: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'Reviewing', value: 'reviewing' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Converted', value: 'converted' },
      ],
      required: true,
      access: {
        create: () => false,
        update: adminOrAnalystField,
      },
    },
    {
      name: 'submittedAt',
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
    {
      name: 'convertedProduct',
      type: 'relationship',
      relationTo: collectionSlugs.products,
      access: {
        create: () => false,
        update: adminOrAnalystField,
      },
    },
    {
      name: 'convertedSimulation',
      type: 'relationship',
      relationTo: collectionSlugs.simulations,
      access: {
        create: () => false,
        update: adminOrAnalystField,
      },
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: collectionSlugs.users,
      filterOptions: {
        role: {
          in: ['admin', 'analyst'],
        },
      },
      access: {
        create: () => false,
        update: adminOrAnalystField,
      },
    },
  ],
}
