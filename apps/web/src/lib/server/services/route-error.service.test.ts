import { describe, expect, it, vi } from 'vitest';
import type { Cookies } from '@sveltejs/kit';

import { PayloadNotFoundError, PayloadPermissionError } from '$lib/server/payload/errors';
import { handlePayloadRouteError } from './route-error.service';

const cookies = {
	delete: vi.fn(),
	get: vi.fn(),
	getAll: vi.fn(),
	serialize: vi.fn(),
	set: vi.fn()
} as unknown as Cookies;

describe('route error service', () => {
	it('maps permission failures to a safe 403 response', () => {
		const result = (() => {
			try {
				handlePayloadRouteError(new PayloadPermissionError(), cookies, '/dashboard');
			} catch (cause) {
				return cause;
			}
		})();

		expect(result).toMatchObject({
			body: { message: 'You do not have permission to view this information.' },
			status: 403
		});
	});

	it('maps missing records to a safe 404 response', () => {
		const result = (() => {
			try {
				handlePayloadRouteError(new PayloadNotFoundError(), cookies, '/reports');
			} catch (cause) {
				return cause;
			}
		})();

		expect(result).toMatchObject({
			body: { message: 'The requested record could not be found.' },
			status: 404
		});
	});
});
