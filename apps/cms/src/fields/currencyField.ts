import type { SelectField } from 'payload'

import { currencyOptions } from '../lib/constants'

type SingleSelectField = Extract<SelectField, { hasMany?: false }>

export const currencyField = (
  overrides: Partial<Omit<SingleSelectField, 'hasMany' | 'type'>> = {},
): SingleSelectField => ({
  name: 'currency',
  type: 'select',
  defaultValue: 'NGN',
  options: currencyOptions,
  required: true,
  ...overrides,
})
