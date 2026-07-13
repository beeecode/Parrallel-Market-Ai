import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PayloadAuthenticationError } from '$lib/server/payload/errors';

const authMocks = vi.hoisted(() => ({
	getAuthenticatedPayloadUser: vi.fn()
}));

vi.mock('$lib/server/payload/auth', () => authMocks);

import { handle } from './hooks.server';

function createEvent(path: string, token?: string) {
	const deleted: string[] = [];
	const headers = new Headers();
	const locals: App.Locals = {
		payloadToken: null,
		user: null
	};

	return {
		deleted,
		event: {
			cookies: {
				delete: (name: string) => deleted.push(name),
				get: () => token,
				getAll: () => [],
				serialize: () => '',
				set: vi.fn()
			},
			fetch,
			locals,
			request: new Request(`http://localhost${path}`),
			route: { id: null },
			setHeaders: vi.fn(),
			url: new URL(`http://localhost${path}`)
		},
		resolve: vi.fn().mockResolvedValue(new Response('ok', { headers }))
	};
}

describe('authentication hook', () => {
	beforeEach(() => {
		authMocks.getAuthenticatedPayloadUser.mockReset();
	});

	it('redirects an unauthenticated protected route to login', async () => {
		const { event, resolve } = createEvent('/reports?simulation=10');

		const result = await Promise.resolve(handle({ event, resolve } as never)).catch(
			(cause: unknown) => cause
		);

		expect(result).toMatchObject({
			location: '/login?returnTo=%2Freports%3Fsimulation%3D10',
			status: 303
		});
		expect(resolve).not.toHaveBeenCalled();
	});

	it('allows the public landing page without authentication', async () => {
		const { event, resolve } = createEvent('/');

		const response = await handle({ event, resolve } as never);

		expect(response.status).toBe(200);
		expect(resolve).toHaveBeenCalledOnce();
		expect(response.headers.get('cache-control')).toBeNull();
	});

	it.each([
		'/products',
		'/customers',
		'/insights',
		'/settings',
		'/request-simulation',
		'/simulations/10/live'
	])('protects %s for unauthenticated users', async (path) => {
		const { event, resolve } = createEvent(path);

		const result = await Promise.resolve(handle({ event, resolve } as never)).catch(
			(cause: unknown) => cause
		);

		expect(result).toMatchObject({
			location: `/login?returnTo=${encodeURIComponent(path)}`,
			status: 303
		});
		expect(resolve).not.toHaveBeenCalled();
	});

	it('redirects authenticated users away from the login page', async () => {
		authMocks.getAuthenticatedPayloadUser.mockResolvedValue({
			email: 'owner@example.com',
			id: 7,
			name: 'Demo Owner',
			role: 'business-owner'
		});
		const { event, resolve } = createEvent('/login', 'valid-token');

		const result = await Promise.resolve(handle({ event, resolve } as never)).catch(
			(cause: unknown) => cause
		);

		expect(result).toMatchObject({ location: '/dashboard', status: 303 });
	});

	it('clears an expired session and redirects to login', async () => {
		authMocks.getAuthenticatedPayloadUser.mockRejectedValue(new PayloadAuthenticationError());
		const { deleted, event, resolve } = createEvent('/dashboard', 'expired-token');

		const result = await Promise.resolve(handle({ event, resolve } as never)).catch(
			(cause: unknown) => cause
		);

		expect(deleted).toContain('parallel_market_session');
		expect(result).toMatchObject({
			location: '/login?returnTo=%2Fdashboard',
			status: 303
		});
	});

	it('adds private no-store caching to authenticated application responses', async () => {
		authMocks.getAuthenticatedPayloadUser.mockResolvedValue({
			email: 'owner@example.com',
			id: 7,
			name: 'Demo Owner',
			role: 'business-owner'
		});
		const { event, resolve } = createEvent('/dashboard', 'valid-token');

		const response = await handle({ event, resolve } as never);

		expect(response.headers.get('cache-control')).toBe('private, no-store');
		expect(event.locals.user?.name).toBe('Demo Owner');
	});
});
