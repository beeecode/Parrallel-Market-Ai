import { fail, redirect } from '@sveltejs/kit';
import { validateEmail, validateRequiredText } from '@parallel-market-ai/validation';

import { loginWithPayload } from '$lib/server/payload/auth';
import {
	PayloadAuthenticationError,
	PayloadNetworkError,
	PayloadRateLimitError,
	PayloadTimeoutError
} from '$lib/server/payload/errors';
import { safeInternalReturnPath, setSessionCookie } from '$lib/server/services/session.service';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => ({
	returnTo: safeInternalReturnPath(url.searchParams.get('returnTo'))
});

export const actions: Actions = {
	default: async ({ cookies, fetch, request, url }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '')
			.trim()
			.toLowerCase();
		const password = String(formData.get('password') ?? '');

		if (!validateEmail(email).valid || !validateRequiredText(password, 'Password', 200).valid) {
			return fail(400, {
				email,
				error: 'Enter a valid email address and password.'
			});
		}

		try {
			const result = await loginWithPayload(fetch, { email, password });
			setSessionCookie(cookies, result.token, result.exp, url);
		} catch (cause) {
			if (cause instanceof PayloadAuthenticationError) {
				return fail(400, {
					email,
					error: 'The email or password is incorrect.'
				});
			}
			if (cause instanceof PayloadRateLimitError) {
				return fail(429, {
					email,
					error: cause.message
				});
			}
			if (cause instanceof PayloadNetworkError || cause instanceof PayloadTimeoutError) {
				return fail(503, {
					email,
					error: 'Sign in is temporarily unavailable. Please try again.'
				});
			}
			return fail(500, {
				email,
				error: 'Sign in could not be completed. Please try again.'
			});
		}

		redirect(303, safeInternalReturnPath(url.searchParams.get('returnTo')));
	}
};
