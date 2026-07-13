import { describe, expect, it, vi } from 'vitest';
import type { Cookies } from '@sveltejs/kit';

import { clearSessionCookie, safeInternalReturnPath, setSessionCookie } from './session.service';

function cookieMock(): {
	cookies: Cookies;
	deleteMock: ReturnType<typeof vi.fn>;
	setMock: ReturnType<typeof vi.fn>;
} {
	const deleteMock = vi.fn();
	const setMock = vi.fn();

	return {
		cookies: {
			delete: deleteMock,
			get: vi.fn(),
			getAll: vi.fn(),
			serialize: vi.fn(),
			set: setMock
		} as unknown as Cookies,
		deleteMock,
		setMock
	};
}

describe('session service', () => {
	it('sets an HTTP-only same-site cookie', () => {
		const { cookies, setMock } = cookieMock();

		setSessionCookie(cookies, 'opaque-token', Math.floor(Date.now() / 1000) + 3_600);

		expect(setMock).toHaveBeenCalledWith(
			'parallel_market_session',
			'opaque-token',
			expect.objectContaining({
				httpOnly: true,
				path: '/',
				sameSite: 'lax'
			})
		);
	});

	it('clears the session cookie at the application root', () => {
		const { cookies, deleteMock } = cookieMock();

		clearSessionCookie(cookies);

		expect(deleteMock).toHaveBeenCalledWith('parallel_market_session', { path: '/' });
	});

	it.each([
		['/reports?simulation=12', '/reports?simulation=12'],
		['https://evil.example/steal', '/dashboard'],
		['//evil.example/steal', '/dashboard'],
		['javascript:alert(1)', '/dashboard'],
		[null, '/dashboard']
	])('normalizes return path %s', (input, expected) => {
		expect(safeInternalReturnPath(input)).toBe(expected);
	});
});
