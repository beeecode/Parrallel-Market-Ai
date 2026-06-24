import type { CollectionBeforeValidateHook } from 'payload'

export function toSlug(value: string): string {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const generateSlug = (sourceField: string): CollectionBeforeValidateHook => ({ data }) => {
  if (!data || data.slug) {
    return data
  }

  const source = data[sourceField]
  if (typeof source === 'string') {
    data.slug = toSlug(source)
  }

  return data
}
