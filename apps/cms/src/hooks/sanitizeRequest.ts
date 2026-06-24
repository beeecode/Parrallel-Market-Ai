import { sanitizePlainText } from '@parallel-market-ai/validation'
import type { CollectionBeforeValidateHook } from 'payload'

const fields = [
  'customerName',
  'email',
  'company',
  'businessType',
  'productName',
  'productDescription',
  'targetMarket',
  'targetLocation',
  'targetCustomers',
  'businessChallenge',
  'simulationGoal',
  'timeline',
  'conversationSummary',
]

export const sanitizeRequest: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) {
    return data
  }

  for (const field of fields) {
    if (typeof data[field] === 'string') {
      data[field] = sanitizePlainText(data[field])
    }
  }

  if (typeof data.email === 'string') {
    data.email = data.email.toLowerCase()
  }

  return data
}
