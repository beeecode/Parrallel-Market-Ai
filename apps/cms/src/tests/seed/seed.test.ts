import type { Payload } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { SeedSummary, upsertRecord } from '../../seed/helpers'

describe('seed helpers', () => {
  it('creates a record when no deterministic match exists', async () => {
    const payload = {
      create: vi.fn().mockResolvedValue({ id: 1, name: 'Demo' }),
      find: vi.fn().mockResolvedValue({ docs: [] }),
      update: vi.fn(),
    } as unknown as Payload

    const result = await upsertRecord({
      collection: 'products',
      data: {
        category: 'Demo',
        currentPrice: 1,
        currency: 'NGN',
        description: 'Demo product',
        name: 'Demo',
        owner: 1,
        slug: 'demo',
        status: 'active',
        targetLocation: 'Lagos',
        targetMarket: 'Demo buyers',
      },
      payload,
      where: {
        slug: {
          equals: 'demo',
        },
      },
    })

    expect(result.action).toBe('created')
    expect(payload.create).toHaveBeenCalledOnce()
    expect(payload.update).not.toHaveBeenCalled()
  })

  it('updates the matched record instead of creating a duplicate', async () => {
    const payload = {
      create: vi.fn(),
      find: vi.fn().mockResolvedValue({ docs: [{ id: 7 }] }),
      update: vi.fn().mockResolvedValue({ id: 7, name: 'Demo' }),
    } as unknown as Payload

    const result = await upsertRecord({
      collection: 'products',
      data: {
        category: 'Demo',
        currentPrice: 1,
        currency: 'NGN',
        description: 'Demo product',
        name: 'Demo',
        owner: 1,
        slug: 'demo',
        status: 'active',
        targetLocation: 'Lagos',
        targetMarket: 'Demo buyers',
      },
      payload,
      where: {
        slug: {
          equals: 'demo',
        },
      },
    })

    expect(result.action).toBe('updated')
    expect(payload.update).toHaveBeenCalledOnce()
    expect(payload.create).not.toHaveBeenCalled()
  })

  it('summarises create and update operations by collection', () => {
    const summary = new SeedSummary()

    summary.record('products', 'created')
    summary.record('products', 'updated')

    expect(summary.entries()).toEqual([
      [
        'products',
        {
          created: 1,
          updated: 1,
        },
      ],
    ])
  })
})
