import { error, redirect, type Cookies } from '@sveltejs/kit';

import {
	PayloadAuthenticationError,
	PayloadIntegrationError,
	PayloadNetworkError,
	PayloadNotFoundError,
	PayloadPermissionError,
	PayloadRateLimitError,
	PayloadTimeoutError,
	PayloadValidationError
} from '$lib/server/payload/errors';
import { clearSessionCookie } from './session.service';

export function handlePayloadRouteError(
	cause: unknown,
	cookies: Cookies,
	returnPath: string
): never {
	if (cause instanceof PayloadAuthenticationError) {
		clearSessionCookie(cookies);
		redirect(303, `/login?returnTo=${encodeURIComponent(returnPath)}`);
	}

	if (cause instanceof PayloadPermissionError) {
		error(403, 'You do not have permission to view this information.');
	}

	if (cause instanceof PayloadNotFoundError) {
		error(404, 'The requested record could not be found.');
	}

	if (cause instanceof PayloadValidationError) {
		error(400, cause.message);
	}

	if (cause instanceof PayloadRateLimitError) {
		error(429, cause.message);
	}

	if (cause instanceof PayloadNetworkError || cause instanceof PayloadTimeoutError) {
		error(503, 'The market data service is temporarily unavailable. Please try again.');
	}

	if (cause instanceof PayloadIntegrationError) {
		error(cause.status ?? 502, cause.message);
	}

	error(500, 'The application could not load this information.');
}
