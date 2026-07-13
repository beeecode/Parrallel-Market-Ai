export class PayloadIntegrationError extends Error {
	readonly status?: number;
	readonly code: string;

	constructor(message: string, code: string, status?: number) {
		super(message);
		this.name = new.target.name;
		this.code = code;
		this.status = status;
	}
}

export class PayloadNetworkError extends PayloadIntegrationError {
	constructor(message = 'The CMS could not be reached.') {
		super(message, 'network');
	}
}

export class PayloadTimeoutError extends PayloadIntegrationError {
	constructor() {
		super('The CMS request timed out.', 'timeout');
	}
}

export class PayloadAuthenticationError extends PayloadIntegrationError {
	constructor(message = 'Your session has expired. Please sign in again.') {
		super(message, 'authentication', 401);
	}
}

export class PayloadPermissionError extends PayloadIntegrationError {
	constructor(message = 'You do not have permission to perform this action.') {
		super(message, 'permission', 403);
	}
}

export class PayloadNotFoundError extends PayloadIntegrationError {
	constructor(message = 'The requested record could not be found.') {
		super(message, 'not-found', 404);
	}
}

export class PayloadValidationError extends PayloadIntegrationError {
	readonly fieldErrors: Record<string, string>;

	constructor(message = 'Check the submitted information and try again.', fieldErrors = {}) {
		super(message, 'validation', 400);
		this.fieldErrors = fieldErrors;
	}
}

export class PayloadConflictError extends PayloadIntegrationError {
	constructor(message = 'The request conflicts with an existing record.') {
		super(message, 'conflict', 409);
	}
}

export class PayloadRateLimitError extends PayloadIntegrationError {
	constructor() {
		super('Too many requests. Please wait and try again.', 'rate-limit', 429);
	}
}

export class PayloadServerError extends PayloadIntegrationError {
	constructor() {
		super('The CMS could not complete the request.', 'server', 500);
	}
}

export class PayloadInvalidResponseError extends PayloadIntegrationError {
	constructor() {
		super('The CMS returned an unexpected response.', 'invalid-response', 502);
	}
}
