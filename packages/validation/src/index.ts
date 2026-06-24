export type ValidationResult = {
  valid: boolean
  error?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function sanitizePlainText(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim()
}

export function validateRequiredText(
  value: unknown,
  fieldLabel: string,
  maximumLength = 10_000,
): ValidationResult {
  if (typeof value !== 'string' || !sanitizePlainText(value)) {
    return { valid: false, error: `${fieldLabel} is required.` }
  }

  if (value.length > maximumLength) {
    return {
      valid: false,
      error: `${fieldLabel} must be ${maximumLength.toLocaleString()} characters or fewer.`,
    }
  }

  return { valid: true }
}

export function validateEmail(value: unknown): ValidationResult {
  if (typeof value !== 'string' || !EMAIL_PATTERN.test(value.trim())) {
    return { valid: false, error: 'Enter a valid email address.' }
  }

  return { valid: true }
}

export function validateSlug(value: unknown): ValidationResult {
  if (typeof value !== 'string' || !SLUG_PATTERN.test(value)) {
    return {
      valid: false,
      error: 'Use lowercase letters, numbers, and single hyphens only.',
    }
  }

  return { valid: true }
}

export function validatePositiveInteger(value: unknown, fieldLabel: string): ValidationResult {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    return { valid: false, error: `${fieldLabel} must be a positive whole number.` }
  }

  return { valid: true }
}

export function validatePercentage(value: unknown, fieldLabel: string): ValidationResult {
  if (value == null) {
    return { valid: true }
  }

  if (typeof value !== 'number' || value < 0 || value > 100) {
    return { valid: false, error: `${fieldLabel} must be between 0 and 100.` }
  }

  return { valid: true }
}

export function validateNonNegativeNumber(value: unknown, fieldLabel: string): ValidationResult {
  if (value == null) {
    return { valid: true }
  }

  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return { valid: false, error: `${fieldLabel} cannot be negative.` }
  }

  return { valid: true }
}

export function validateRange(
  minimum: unknown,
  maximum: unknown,
  fieldLabel: string,
): ValidationResult {
  const minimumValidation = validateNonNegativeNumber(minimum, `${fieldLabel} minimum`)
  if (!minimumValidation.valid) {
    return minimumValidation
  }

  const maximumValidation = validateNonNegativeNumber(maximum, `${fieldLabel} maximum`)
  if (!maximumValidation.valid) {
    return maximumValidation
  }

  if (
    typeof minimum === 'number' &&
    typeof maximum === 'number' &&
    maximum < minimum
  ) {
    return {
      valid: false,
      error: `${fieldLabel} maximum cannot be below the minimum.`,
    }
  }

  return { valid: true }
}

export function validateSentimentTotal(values: unknown[]): ValidationResult {
  if (values.some((value) => typeof value !== 'number')) {
    return { valid: false, error: 'Sentiment values must be valid percentages.' }
  }

  const total = (values as number[]).reduce((sum, value) => sum + value, 0)
  if (Math.abs(total - 100) > 0.01) {
    return { valid: false, error: 'Positive, neutral, and negative sentiment must total 100.' }
  }

  return { valid: true }
}

export function validateMessageContent(value: unknown, maximumLength = 4_000): ValidationResult {
  return validateRequiredText(value, 'Message content', maximumLength)
}
