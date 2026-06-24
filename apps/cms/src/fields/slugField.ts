import type { TextField } from 'payload'

import { slugFieldValidation } from '../lib/validation'

type SingleTextField = Extract<TextField, { hasMany?: false }>

export const slugField = (
  overrides: Partial<Omit<SingleTextField, 'hasMany' | 'type'>> = {},
): SingleTextField => ({
  name: 'slug',
  type: 'text',
  index: true,
  required: true,
  unique: true,
  validate: slugFieldValidation,
  admin: {
    description: 'URL-safe identifier generated from the title or name when left empty.',
  },
  ...overrides,
})
