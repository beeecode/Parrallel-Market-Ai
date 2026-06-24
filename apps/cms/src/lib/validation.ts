import {
  validateEmail,
  validateMessageContent,
  validateNonNegativeNumber,
  validatePercentage,
  validatePositiveInteger,
  validateRequiredText,
  validateSlug,
} from '@parallel-market-ai/validation'

function resultToPayload(result: { valid: boolean; error?: string }): true | string {
  return result.valid ? true : (result.error ?? 'Invalid value.')
}

export const requiredText =
  (label: string, maximumLength?: number) => (value: string | null | undefined) =>
    resultToPayload(validateRequiredText(value, label, maximumLength))

export const emailField = (value: string | null | undefined) =>
  resultToPayload(validateEmail(value))

export const slugFieldValidation = (value: string | null | undefined) =>
  resultToPayload(validateSlug(value))

export const positiveInteger = (label: string) => (value: number | null | undefined) =>
  resultToPayload(validatePositiveInteger(value, label))

export const percentage = (label: string) => (value: number | null | undefined) =>
  resultToPayload(validatePercentage(value, label))

export const nonNegativeNumber = (label: string) => (value: number | null | undefined) =>
  resultToPayload(validateNonNegativeNumber(value, label))

export const messageContent = (value: string | null | undefined) =>
  resultToPayload(validateMessageContent(value))

export const reasonableAge = (value: number | null | undefined) => {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 18 || value > 100) {
    return 'Age must be a whole number between 18 and 100.'
  }

  return true
}
