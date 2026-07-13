import { describe, expect, it, vi } from 'vitest';

import { PayloadAuthenticationError } from './errors';
import { loginWithPayload } from './auth';

function asFetch(mock: ReturnType<typeof vi.fn>): typeof globalThis.fetch {
	return mock as unknown as typeof globalThis.fetch;
}

describe('Payload authentication', () => {
	it('maps a successful login to a frontend-safe user', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					exp: 2_000_000_000,
					token: 'opaque-test-token',
					user: {
						company: 'Parallel Foods',
						email: 'owner@example.com',
						id: 7,
						isActive: true,
						name: 'Demo Owner',
						role: 'business-owner'
					}
				}),
				{ status: 200 }
			)
		);

		const result = await loginWithPayload(asFetch(fetchMock), {
			email: 'owner@example.com',
			password: 'not-logged'
		});

		expect(result.user).toEqual({
			company: 'Parallel Foods',
			email: 'owner@example.com',
			id: 7,
			name: 'Demo Owner',
			role: 'business-owner'
		});
		expect(result.token).toBe('opaque-test-token');
	});

	it('returns a generic authentication error for invalid credentials', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ message: 'Incorrect password for owner@example.com' }), {
				status: 401
			})
		);

		await expect(
			loginWithPayload(asFetch(fetchMock), {
				email: 'owner@example.com',
				password: 'wrong'
			})
		).rejects.toBeInstanceOf(PayloadAuthenticationError);
	});
});
