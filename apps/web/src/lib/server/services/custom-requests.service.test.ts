import { describe, expect, it, vi } from 'vitest';

import {
	PayloadNetworkError,
	PayloadPermissionError,
	PayloadValidationError
} from '$lib/server/payload/errors';
import {
	createCustomSimulationRequest,
	customRequestInputFromFormData
} from './custom-requests.service';

import type { RequestAgentValues } from '$lib/types/request-agent';

const values: RequestAgentValues = {
	budget: '150000',
	businessChallenge: 'Delivery fee objections and checkout trust concerns.',
	businessType: 'Food delivery',
	company: 'Amazing Taste Delicacies',
	currency: 'NGN',
	currentPrice: '4200',
	customerName: 'Daniel Adeyemi',
	email: 'daniel@example.com',
	productDescription: 'A premium shawarma menu for mobile-first ordering.',
	productName: 'Shawarma Spot Menu',
	simulationGoal: 'Test price sensitivity and conversion probability.',
	targetCustomers: 'Young professionals and students who order lunch online.',
	targetLocation: 'Lagos, Nigeria',
	targetMarket: 'Lagos food delivery customers',
	timeline: 'Within 2 weeks'
};

function asFetch(mock: ReturnType<typeof vi.fn>): typeof globalThis.fetch {
	return mock as unknown as typeof globalThis.fetch;
}

function createdRequestResponse(): Response {
	return new Response(
		JSON.stringify({
			doc: {
				budget: 150000,
				businessChallenge: values.businessChallenge,
				businessType: values.businessType,
				company: values.company,
				conversationSummary: [
					`Business: ${values.company}`,
					`Product: ${values.productName}`,
					`Target Market: ${values.targetMarket}`,
					`Challenge: ${values.businessChallenge}`,
					`Goal: ${values.simulationGoal}`
				].join('\n'),
				currency: values.currency,
				currentPrice: 4200,
				customerName: values.customerName,
				email: values.email,
				id: 24,
				productDescription: values.productDescription,
				productName: values.productName,
				simulationGoal: values.simulationGoal,
				status: 'new',
				targetCustomers: values.targetCustomers,
				targetLocation: values.targetLocation,
				targetMarket: values.targetMarket,
				timeline: values.timeline
			},
			message: 'Custom simulation request successfully created.'
		}),
		{ status: 201 }
	);
}

describe('custom request service', () => {
	it('reads request-agent values from form data with sanitization', () => {
		const formData = new FormData();
		for (const [field, value] of Object.entries(values)) {
			formData.set(field, ` ${value}\u0000 `);
		}

		expect(customRequestInputFromFormData(formData)).toMatchObject(values);
	});

	it('creates a Payload custom simulation request with a deterministic summary', async () => {
		const fetchMock = vi.fn().mockResolvedValue(createdRequestResponse());

		const result = await createCustomSimulationRequest(asFetch(fetchMock), 'valid-token', values);

		expect(result).toEqual({
			id: '24',
			productName: 'Shawarma Spot Menu',
			reference: 'CSR-00024',
			status: 'new'
		});
		expect(fetchMock).toHaveBeenCalledOnce();
		const requestInit = fetchMock.mock.calls[0][1] as RequestInit;
		expect(requestInit.method).toBe('POST');
		expect(requestInit.headers).toMatchObject({
			authorization: 'JWT valid-token'
		});
		expect(String(requestInit.body)).toContain('"conversationSummary"');
	});

	it('rejects invalid submissions before calling Payload', async () => {
		const fetchMock = vi.fn();

		await expect(
			createCustomSimulationRequest(asFetch(fetchMock), 'valid-token', {
				...values,
				currentPrice: '-1',
				email: 'bad-email'
			})
		).rejects.toBeInstanceOf(PayloadValidationError);

		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('maps Payload permission and network failures to safe errors', async () => {
		const permissionFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ message: 'private detail' }), {
				status: 403
			})
		);
		const networkFetch = vi.fn().mockRejectedValue(new TypeError('connection refused'));

		await expect(
			createCustomSimulationRequest(asFetch(permissionFetch), 'valid-token', values)
		).rejects.toBeInstanceOf(PayloadPermissionError);
		await expect(
			createCustomSimulationRequest(asFetch(networkFetch), 'valid-token', values)
		).rejects.toBeInstanceOf(PayloadNetworkError);
	});
});
