import type { CurrencyCode } from '@parallel-market-ai/shared-types'

export const currencyOptions: Array<{ label: string; value: CurrencyCode }> = [
  { label: 'Nigerian Naira (NGN)', value: 'NGN' },
  { label: 'United States Dollar (USD)', value: 'USD' },
  { label: 'British Pound (GBP)', value: 'GBP' },
  { label: 'Euro (EUR)', value: 'EUR' },
]

export const requestTextLimits = {
  short: 160,
  medium: 1_000,
  long: 4_000,
} as const
