import {
  validateEmail,
  validateMessageContent,
  validateNonNegativeNumber,
  validatePercentage,
  validateRange,
  validateSentimentTotal,
} from '@parallel-market-ai/validation'
import type { PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { validateMessageRelationships } from '../../hooks'

describe('domain validation', () => {
  it('rejects a negative price', () => {
    expect(validateNonNegativeNumber(-1, 'Price')).toEqual({
      error: 'Price cannot be negative.',
      valid: false,
    })
  })

  it('rejects percentages above 100', () => {
    expect(validatePercentage(101, 'Success probability').valid).toBe(false)
  })

  it('rejects invalid email addresses', () => {
    expect(validateEmail('not-an-email').valid).toBe(false)
  })

  it('rejects empty messages', () => {
    expect(validateMessageContent('   ').valid).toBe(false)
  })

  it('rejects invalid revenue and pricing ranges', () => {
    expect(validateRange(6_800_000, 4_200_000, 'Revenue').valid).toBe(false)
    expect(validateRange(3_800, 3_200, 'Optimal price').valid).toBe(false)
  })

  it('rejects sentiment totals that do not equal 100', () => {
    expect(validateSentimentTotal([49, 28, 20]).valid).toBe(false)
  })
})

describe('relationship validation', () => {
  it('rejects a conversation from another simulation', async () => {
    const findByID = vi.fn().mockResolvedValue({
      simulation: 99,
    })
    const req = {
      payload: {
        findByID,
      },
    } as unknown as PayloadRequest

    await expect(
      validateMessageRelationships({
        data: {
          conversation: 10,
          customerAgent: 20,
          senderType: 'customer',
          simulation: 1,
        },
        req,
      } as never),
    ).rejects.toThrow('The selected conversation does not belong to this simulation.')
  })
})
