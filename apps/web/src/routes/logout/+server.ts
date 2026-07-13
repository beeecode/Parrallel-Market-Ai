import { redirect } from '@sveltejs/kit';

import { logoutFromPayload } from '$lib/server/payload/auth';
import { clearSessionCookie, getSessionToken } from '$lib/server/services/session.service';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, fetch }) => {
	const token = getSessionToken(cookies);

	if (token) {
		try {
			await logoutFromPayload(fetch, token);
		} catch {
			// The local session is cleared even if the remote session already expired.
		}
	}

	clearSessionCookie(cookies);
	redirect(303, '/login');
};
