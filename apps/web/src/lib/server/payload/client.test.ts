import { describe, expect, it, vi } from 'vitest';

import {
	PayloadAuthenticationError,
	PayloadInvalidResponseError,
	PayloadNetworkError,
	PayloadNotFoundError,
	PayloadPermissionError,
	PayloadServerError,
	PayloadTimeoutError,
	PayloadValidationError
} from './errors';
import { payloadRequest } from './client';

function asFetch(mock: ReturnType<typeof vi.fn>): typeof globalThis.fetch {
	return mock as unknown as typeof globalThis.fetch;
}

describe('payloadRequest', () => {
	it('returns validated JSON and builds escaped query parameters', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ value: 72 }), {
				headers: { 'content-type': 'application/json' },
				status: 200
			})
		);

		const result = await payloadRequest({
			fetch: asFetch(fetchMock),
			path: '/api/simulations',
			query: { where: { title: { equals: 'Shawarma Spot Menu' } } },
			validate: (value) => value as { value: number }
		});

		expect(result).toEqual({ value: 72 });
		expect(fetchMock).toHaveBeenCalledOnce();
		expect(String(fetchMock.mock.calls[0][0])).toContain(
			'where%5Btitle%5D%5Bequals%5D=Shawarma+Spot+Menu'
		);
	});

	it.each([
		[401, PayloadAuthenticationError],
		[403, PayloadPermissionError],
		[404, PayloadNotFoundError],
		[500, PayloadServerError]
	])('maps HTTP %s to a safe integration error', async (status, ErrorType) => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(
				new Response(JSON.stringify({ message: 'private upstream detail' }), { status })
			);

		await expect(
			payloadRequest({
				fetch: asFetch(fetchMock),
				path: '/api/private',
				validate: (value) => value
			})
		).rejects.toBeInstanceOf(ErrorType);
	});

	it('maps Payload field validation errors', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					errors: [{ data: { field: 'content' }, message: 'Content is required.' }],
					message: 'Validation failed.'
				}),
				{ status: 400 }
			)
		);

		const error = await payloadRequest({
			fetch: asFetch(fetchMock),
			path: '/api/messages',
			validate: (value) => value
		}).catch((cause: unknown) => cause);

		expect(error).toBeInstanceOf(PayloadValidationError);
		expect((error as PayloadValidationError).fieldErrors).toEqual({
			content: 'Content is required.'
		});
	});

	it('rejects invalid JSON without exposing the response body', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(new Response('<html>failure</html>', { status: 200 }));

		await expect(
			payloadRequest({
				fetch: asFetch(fetchMock),
				path: '/api/simulations',
				validate: (value) => value
			})
		).rejects.toBeInstanceOf(PayloadInvalidResponseError);
	});

	it('maps network failures', async () => {
		const fetchMock = vi.fn().mockRejectedValue(new TypeError('connection refused'));

		await expect(
			payloadRequest({
				fetch: asFetch(fetchMock),
				path: '/api/simulations',
				validate: (value) => value
			})
		).rejects.toBeInstanceOf(PayloadNetworkError);
	});

	it('aborts requests that exceed the timeout', async () => {
		const fetchMock = vi.fn((_url: string, init?: RequestInit) => {
			return new Promise((_resolve, reject) => {
				init?.signal?.addEventListener('abort', () => {
					reject(new DOMException('Aborted', 'AbortError'));
				});
			});
		});

		await expect(
			payloadRequest({
				fetch: asFetch(fetchMock),
				path: '/api/simulations',
				timeoutMs: 5,
				validate: (value) => value
			})
		).rejects.toBeInstanceOf(PayloadTimeoutError);
	});
});
