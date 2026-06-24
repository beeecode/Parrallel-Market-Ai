import type { CollectionBeforeChangeHook } from 'payload'

export const setSubmittedAt: CollectionBeforeChangeHook = ({ data, operation }) => {
  if (operation === 'create' && !data.submittedAt) {
    data.submittedAt = new Date().toISOString()
  }

  return data
}

export const setGeneratedAt: CollectionBeforeChangeHook = ({ data }) => {
  if (data.status === 'completed' && !data.generatedAt) {
    data.generatedAt = new Date().toISOString()
  }

  return data
}
