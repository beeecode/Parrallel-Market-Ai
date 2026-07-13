import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

import {
	PayloadAuthenticationError,
	PayloadConflictError,
	PayloadIntegrationError,
	PayloadInvalidResponseError,
	PayloadNetworkError,
	PayloadNotFoundError,
	PayloadPermissionError,
	PayloadRateLimitError,
	PayloadServerError,
	PayloadTimeoutError,
	PayloadValidationError
} from './errors';
import { buildPayloadQuery, type PayloadQueryValue } from './query';

const DEFAULT_TIMEOUT_MS = 20_000;

type PayloadRequestOptions<T> = {
	body?: unknown;
	fetch: typeof globalThis.fetch;
	method?: 'GET' | 'PATCH' | 'POST';
	path: string;
	query?: Record<string, PayloadQueryValue | undefined>;
	timeoutMs?: number;
	token?: string;
	validate: (value: unknown) => T;
};

function getCmsApiUrl(): string {
	return (env.CMS_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
}

function safeErrorMessage(value: unknown): string | undefined {
	if (typeof value !== 'object' || value === null) return undefined;

	const message = Reflect.get(value, 'message');
	return typeof message === 'string' && message.length <= 300 ? message : undefined;
}

function extractFieldErrors(value: unknown): Record<string, string> {
	if (typeof value !== 'object' || value === null) return {};

	const errors = Reflect.get(value, 'errors');
	if (!Array.isArray(errors)) return {};

	const fieldErrors: Record<string, string> = {};
	for (const error of errors) {
		if (typeof error !== 'object' || error === null) continue;

		const message = Reflect.get(error, 'message');
		const data = Reflect.get(error, 'data');
		const field =
			typeof data === 'object' && data !== null ? Reflect.get(data, 'field') : undefined;

		if (typeof field === 'string' && typeof message === 'string') {
			fieldErrors[field] = message;
		}
	}

	return fieldErrors;
}

function errorForStatus(status: number, payload: unknown): PayloadIntegrationError {
	const message = safeErrorMessage(payload);

	if (status === 401) return new PayloadAuthenticationError();
	if (status === 403) return new PayloadPermissionError();
	if (status === 404) return new PayloadNotFoundError();
	if (status === 409) return new PayloadConflictError();
	if (status === 429) return new PayloadRateLimitError();
	if (status === 400 || status === 422) {
		return new PayloadValidationError(
			message || 'Check the submitted information and try again.',
			extractFieldErrors(payload)
		);
	}

	return new PayloadServerError();
}

export async function payloadRequest<T>({
	body,
	fetch,
	method = 'GET',
	path,
	query,
	timeoutMs = DEFAULT_TIMEOUT_MS,
	token,
	validate
}: PayloadRequestOptions<T>): Promise<T> {
	const queryString = buildPayloadQuery(query).toString();
	const url = `${getCmsApiUrl()}${path.startsWith('/') ? path : `/${path}`}${
		queryString ? `?${queryString}` : ''
	}`;
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetch(url, {
			method,
			headers: {
				accept: 'application/json',
				...(body === undefined ? {} : { 'content-type': 'application/json' }),
				...(token ? { authorization: `JWT ${token}` } : {})
			},
			body: body === undefined ? undefined : JSON.stringify(body),
			signal: controller.signal
		});

		const text = await response.text();
		let responseBody: unknown = null;

		if (text) {
			try {
				responseBody = JSON.parse(text) as unknown;
			} catch {
				throw new PayloadInvalidResponseError();
			}
		}

		if (!response.ok) {
			if (dev) {
				console.warn(`[Payload] ${method} ${path} returned ${response.status}.`);
			}
			throw errorForStatus(response.status, responseBody);
		}

		try {
			return validate(responseBody);
		} catch (error) {
			if (error instanceof PayloadIntegrationError) throw error;
			throw new PayloadInvalidResponseError();
		}
	} catch (error) {
		if (error instanceof PayloadIntegrationError) throw error;
		if (error instanceof DOMException && error.name === 'AbortError') {
			throw new PayloadTimeoutError();
		}
		throw new PayloadNetworkError();
	} finally {
		clearTimeout(timeout);
	}
}
