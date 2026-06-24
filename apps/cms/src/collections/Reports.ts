import type { ArrayField, CollectionConfig } from 'payload'

import {
  adminOrAnalyst,
  adminOrAnalystField,
  adminsOnly,
  relatedSimulationRead,
} from '../access'
import { auditFields, currencyField } from '../fields'
import { auditUser, setGeneratedAt, validateReport } from '../hooks'
import { collectionSlugs } from '../lib/collectionSlugs'
import { nonNegativeNumber, percentage, requiredText } from '../lib/validation'

const insightArray = (
  name: string,
  label: string,
  importanceLabel: string,
  importanceOptions: Array<{ label: string; value: string }>,
): ArrayField => ({
  name,
  label,
  type: 'array',
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      validate: requiredText(`${label} label`, 240),
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 1_500,
    },
    {
      name: 'importance',
      label: importanceLabel,
      type: 'select',
      options: importanceOptions,
      required: true,
    },
  ],
})

export const Reports: CollectionConfig = {
  slug: collectionSlugs.reports,
  labels: {
    singular: 'Report',
    plural: 'Reports',
  },
  admin: {
    group: 'Reporting',
    useAsTitle: 'id',
    defaultColumns: [
      'simulation',
      'status',
      'version',
      'successProbability',
      'generatedAt',
    ],
  },
  access: {
    create: adminOrAnalyst,
    delete: adminsOnly,
    read: relatedSimulationRead,
    update: adminOrAnalyst,
  },
  hooks: {
    beforeValidate: [validateReport],
    beforeChange: [setGeneratedAt, auditUser],
  },
  indexes: [
    {
      fields: ['simulation', 'version'],
      unique: true,
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
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Generating', value: 'generating' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
      ],
      required: true,
    },
    {
      name: 'successProbability',
      type: 'number',
      min: 0,
      max: 100,
      required: true,
      validate: percentage('Success probability'),
      access: {
        create: adminOrAnalystField,
        update: adminOrAnalystField,
      },
    },
    {
      name: 'positiveSentiment',
      type: 'number',
      min: 0,
      max: 100,
      required: true,
      validate: percentage('Positive sentiment'),
    },
    {
      name: 'neutralSentiment',
      type: 'number',
      min: 0,
      max: 100,
      required: true,
      validate: percentage('Neutral sentiment'),
    },
    {
      name: 'negativeSentiment',
      type: 'number',
      min: 0,
      max: 100,
      required: true,
      validate: percentage('Negative sentiment'),
    },
    insightArray('positiveFeedback', 'Positive Feedback', 'Importance', [
      { label: 'Low', value: 'low' },
      { label: 'Medium', value: 'medium' },
      { label: 'High', value: 'high' },
    ]),
    insightArray('customerObjections', 'Customer Objections', 'Severity', [
      { label: 'Low', value: 'low' },
      { label: 'Medium', value: 'medium' },
      { label: 'High', value: 'high' },
      { label: 'Critical', value: 'critical' },
    ]),
    {
      name: 'optimalPriceMinimum',
      type: 'number',
      min: 0,
      required: true,
      validate: nonNegativeNumber('Optimal minimum price'),
    },
    {
      name: 'optimalPriceMaximum',
      type: 'number',
      min: 0,
      required: true,
      validate: nonNegativeNumber('Optimal maximum price'),
    },
    {
      name: 'currentAveragePrice',
      type: 'number',
      min: 0,
      required: true,
      validate: nonNegativeNumber('Current average price'),
    },
    currencyField(),
    {
      name: 'revenueMinimum',
      type: 'number',
      min: 0,
      required: true,
      validate: nonNegativeNumber('Minimum revenue'),
    },
    {
      name: 'revenueMaximum',
      type: 'number',
      min: 0,
      required: true,
      validate: nonNegativeNumber('Maximum revenue'),
    },
    insightArray('riskFactors', 'Risk Factors', 'Severity', [
      { label: 'Low', value: 'low' },
      { label: 'Medium', value: 'medium' },
      { label: 'High', value: 'high' },
      { label: 'Critical', value: 'critical' },
    ]),
    insightArray('recommendations', 'Recommendations', 'Priority', [
      { label: 'Low', value: 'low' },
      { label: 'Medium', value: 'medium' },
      { label: 'High', value: 'high' },
    ]),
    {
      name: 'executiveSummary',
      type: 'textarea',
      required: true,
      maxLength: 8_000,
      validate: requiredText('Executive summary', 8_000),
    },
    {
      name: 'generatedAt',
      type: 'date',
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'version',
      type: 'number',
      defaultValue: 1,
      min: 1,
      required: true,
    },
    ...auditFields,
  ],
}
