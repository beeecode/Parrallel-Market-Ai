import type { LoginInput, LoginResult } from '$lib/types/auth';
import { mapAuthenticatedUser } from '$lib/server/mappers/user.mapper';

import { PayloadAuthenticationError } from './errors';
import { payloadRequest } from './client';
import {
	isPayloadLoginResponse,
	isPayloadMeResponse,
	type PayloadLoginResponse,
	type PayloadMeResponse
} from './types';

export async function loginWithPayload(
	fetch: typeof globalThis.fetch,
	input: LoginInput
): Promise<LoginResult> {
	const response = await payloadRequest<PayloadLoginResponse>({
		body: input,
		fetch,
		method: 'POST',
		path: '/api/users/login',
		validate: (value) => {
			if (!isPayloadLoginResponse(value)) throw new Error('Invalid login response.');
			return value;
		}
	});

	return {
		exp: response.exp,
		token: response.token,
		user: mapAuthenticatedUser(response.user)
	};
}

export async function getAuthenticatedPayloadUser(fetch: typeof globalThis.fetch, token: string) {
	const response = await payloadRequest<PayloadMeResponse>({
		fetch,
		path: '/api/users/me',
		token,
		validate: (value) => {
			if (!isPayloadMeResponse(value)) throw new Error('Invalid session response.');
			return value;
		}
	});

	if (!response.user || response.user.isActive === false) {
		throw new PayloadAuthenticationError();
	}

	return mapAuthenticatedUser(response.user);
}

export async function logoutFromPayload(
	fetch: typeof globalThis.fetch,
	token: string
): Promise<void> {
	await payloadRequest({
		body: {},
		fetch,
		method: 'POST',
		path: '/api/users/logout',
		token,
		validate: () => undefined
	});
}
