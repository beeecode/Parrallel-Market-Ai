import { describe, expect, it } from 'vitest';

import { load } from './+page.server';

describe('public landing route', () => {
	it('loads publicly without redirecting unauthenticated visitors', async () => {
		const result = await load({ locals: { payloadToken: null, user: null } } as never);

		expect(result).toEqual({ isAuthenticated: false });
	});

	it('keeps the landing page available to authenticated visitors', async () => {
		const result = await load({
			locals: {
				payloadToken: 'server-only-token',
				user: {
					email: 'owner@example.com',
					id: 7,
					name: 'Demo Owner',
					role: 'business-owner'
				}
			}
		} as never);

		expect(result).toEqual({ isAuthenticated: true });
	});
});
