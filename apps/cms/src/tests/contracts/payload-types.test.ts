import { describe, expect, it } from 'vitest'

import type {
  Conversation,
  CustomerAgent,
  Message,
  Product,
  Report,
  Simulation,
  User,
} from '../../payload-types'

const selectedFields = {
  conversation: [
    'id',
    'simulation',
    'customerAgent',
    'status',
    'messageCount',
  ] as const satisfies readonly (keyof Conversation)[],
  customerAgent: [
    'id',
    'simulation',
    'name',
    'age',
    'avatar',
  ] as const satisfies readonly (keyof CustomerAgent)[],
  message: [
    'id',
    'conversation',
    'simulation',
    'senderType',
    'content',
    'clientSubmissionId',
  ] as const satisfies readonly (keyof Message)[],
  product: [
    'id',
    'name',
    'slug',
    'targetMarket',
    'targetLocation',
    'currency',
  ] as const satisfies readonly (keyof Product)[],
  report: [
    'id',
    'simulation',
    'status',
    'successProbability',
    'positiveFeedback',
  ] as const satisfies readonly (keyof Report)[],
  simulation: [
    'id',
    'owner',
    'product',
    'title',
    'status',
    'currency',
  ] as const satisfies readonly (keyof Simulation)[],
  user: [
    'id',
    'name',
    'email',
    'role',
    'company',
    'avatar',
    'isActive',
  ] as const satisfies readonly (keyof User)[],
}

describe('frontend REST contract fields', () => {
  it('remain represented by generated Payload document types', () => {
    expect(Object.keys(selectedFields)).toHaveLength(7)
  })
})
