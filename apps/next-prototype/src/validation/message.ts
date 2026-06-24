const MAX_MESSAGE_LENGTH = 240;

export type MessageValidationResult = {
  valid: boolean;
  error?: string;
};

export function validateMessage(value: string): MessageValidationResult {
  const trimmed = value.trim();

  if (!trimmed) {
    return { valid: false, error: "Enter a message before sending." };
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return {
      valid: false,
      error: `Keep messages under ${MAX_MESSAGE_LENGTH} characters.`,
    };
  }

  return { valid: true };
}
