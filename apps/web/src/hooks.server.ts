import { error, redirect, type Handle } from '@sveltejs/kit';

import { getAuthenticatedPayloadUser } from '$lib/server/payload/auth';
import {
	PayloadAuthenticationError,
	PayloadNetworkError,
	PayloadTimeoutError
} from '$lib/server/payload/errors';
import { mockAuthenticatedUser } from '$lib/server/mock/data';
import { isFrontendMockMode, mockPayloadToken } from '$lib/server/mock/mode';
import { clearSessionCookie, getSessionToken } from '$lib/server/services/session.service';

const protectedRoutes = [
	'/dashboard',
	'/simulations',
	'/products',
	'/customers',
	'/reports',
	'/insights',
	'/settings',
	'/request-simulation'
];

function isProtected(pathname: string): boolean {
	return protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export const handle: Handle = async ({ event, resolve }) => {
	const token = getSessionToken(event.cookies);
	event.locals.payloadToken = token;
	event.locals.user = null;

	if (isFrontendMockMode()) {
		event.locals.payloadToken = mockPayloadToken;
		event.locals.user = mockAuthenticatedUser;

		if (event.url.pathname === '/login') {
			redirect(303, '/dashboard');
		}

		const response = await resolve(event);

		if (isProtected(event.url.pathname)) {
			response.headers.set('cache-control', 'private, no-store');
		}

		return response;
	}

	if (token) {
		try {
			event.locals.user = await getAuthenticatedPayloadUser(event.fetch, token);
		} catch (cause) {
			if (cause instanceof PayloadAuthenticationError) {
				clearSessionCookie(event.cookies);
				event.locals.payloadToken = null;
			} else if (cause instanceof PayloadNetworkError || cause instanceof PayloadTimeoutError) {
				if (isProtected(event.url.pathname)) {
					error(503, 'The authentication service is temporarily unavailable.');
				}
			} else {
				throw cause;
			}
		}
	}

	if (event.url.pathname === '/login' && event.locals.user) {
		redirect(303, '/dashboard');
	}

	if (isProtected(event.url.pathname) && !event.locals.user) {
		const returnPath = `${event.url.pathname}${event.url.search}`;
		redirect(303, `/login?returnTo=${encodeURIComponent(returnPath)}`);
	}

	const response = await resolve(event);

	if (isProtected(event.url.pathname) || event.url.pathname === '/login') {
		response.headers.set('cache-control', 'private, no-store');
	}

	return response;
};
