import type { CollectionConfig } from 'payload'

import {
  adminsOnly,
  relatedSimulationCreate,
  relatedSimulationRead,
  relatedSimulationUpdate,
} from '../access'
import { auditFields } from '../fields'
import { auditUser } from '../hooks'
import { collectionSlugs } from '../lib/collectionSlugs'
import { reasonableAge, requiredText } from '../lib/validation'

export const CustomerAgents: CollectionConfig = {
  slug: collectionSlugs.customerAgents,
  labels: {
    singular: 'Customer Agent',
    plural: 'Customer Agents',
  },
  admin: {
    group: 'Simulation Operations',
    useAsTitle: 'name',
    defaultColumns: ['name', 'age', 'location', 'simulation', 'priceSensitivity', 'isActive'],
  },
  access: {
    create: relatedSimulationCreate,
    delete: adminsOnly,
    read: relatedSimulationRead,
    update: relatedSimulationUpdate,
  },
  hooks: {
    beforeChange: [auditUser],
  },
  indexes: [
    {
      fields: ['simulation', 'isActive'],
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
      name: 'name',
      type: 'text',
      required: true,
      validate: requiredText('Agent name', 160),
    },
    {
      name: 'age',
      type: 'number',
      min: 18,
      max: 100,
      required: true,
      validate: reasonableAge,
    },
    {
      name: 'location',
      type: 'text',
      required: true,
      validate: requiredText('Location', 240),
    },
    {
      name: 'occupation',
      type: 'text',
      maxLength: 200,
    },
    {
      name: 'incomeLevel',
      type: 'text',
      maxLength: 160,
    },
    {
      name: 'personality',
      type: 'textarea',
      maxLength: 1_000,
    },
    {
      name: 'interests',
      type: 'array',
      fields: [
        {
          name: 'interest',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'buyingBehaviour',
      type: 'textarea',
      maxLength: 1_500,
    },
    {
      name: 'priceSensitivity',
      type: 'select',
      defaultValue: 'moderate',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Moderate', value: 'moderate' },
        { label: 'High', value: 'high' },
        { label: 'Very High', value: 'very-high' },
      ],
      required: true,
    },
    {
      name: 'communicationStyle',
      type: 'textarea',
      maxLength: 1_000,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: collectionSlugs.media,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      index: true,
    },
    ...auditFields,
  ],
}
