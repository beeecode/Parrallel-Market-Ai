import { describe, expect, it } from 'vitest'

import { collections } from '../../collections'

describe('Payload collection configuration', () => {
  it('registers the complete Phase 3 collection set once', () => {
    expect(collections.map((collection) => collection.slug)).toEqual([
      'users',
      'media',
      'pages',
      'products',
      'simulations',
      'customer-agents',
      'conversations',
      'messages',
      'reports',
      'custom-simulation-requests',
    ])
    expect(new Set(collections.map((collection) => collection.slug)).size).toBe(10)
  })

  it('contains the required simulation summary fields', () => {
    const simulation = collections.find((collection) => collection.slug === 'simulations')
    const fieldNames = simulation?.fields
      .filter((field) => 'name' in field)
      .map((field) => ('name' in field ? field.name : null))

    expect(fieldNames).toEqual(
      expect.arrayContaining([
        'owner',
        'product',
        'customerCount',
        'conversationCount',
        'successProbability',
        'purchaseRate',
        'repeatRate',
        'revenueMinimum',
        'revenueMaximum',
      ]),
    )
  })
})
