import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PayloadPermissionError, PayloadValidationError } from '$lib/server/payload/errors';
import type { RequestAgentValues } from '$lib/types/request-agent';

const serviceMocks = vi.hoisted(() => ({
	createCustomSimulationRequest: vi.fn(),
	customRequestInputFromFormData: vi.fn()
}));

vi.mock('$lib/server/services/custom-requests.service', () => ({
	createCustomSimulationRequest: serviceMocks.createCustomSimulationRequest,
	customRequestInputFromFormData: serviceMocks.customRequestInputFromFormData
}));

import { actions, load } from './+page.server';

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

const user = {
	company: 'Amazing Taste Delicacies',
	email: 'daniel@example.com',
	id: 7,
	name: 'Daniel Adeyemi',
	role: 'business-owner' as const
};

function request(): Request {
	return new Request('http://localhost/request-simulation', {
		body: new URLSearchParams(values),
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		method: 'POST'
	});
}

function event(overrides: Record<string, unknown> = {}) {
	return {
		cookies: {},
		fetch,
		locals: {
			payloadToken: 'valid-token',
			user
		},
		request: request(),
		url: new URL('http://localhost/request-simulation'),
		...overrides
	};
}

describe('/request-simulation route module', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		serviceMocks.customRequestInputFromFormData.mockReturnValue(values);
	});

	it('prefills the assistant from the authenticated user', async () => {
		const result = (await load({
			locals: {
				payloadToken: 'valid-token',
				user
			}
		} as never)) as { initialValues: RequestAgentValues };

		expect(result.initialValues).toMatchObject({
			company: 'Amazing Taste Delicacies',
			customerName: 'Daniel Adeyemi',
			email: 'daniel@example.com'
		});
	});

	it('creates a custom simulation request through the server service', async () => {
		serviceMocks.createCustomSimulationRequest.mockResolvedValue({
			id: '24',
			productName: 'Shawarma Spot Menu',
			reference: 'CSR-00024',
			status: 'new'
		});

		const result = await actions.default!(event() as never);

		expect(result).toEqual({
			request: {
				id: '24',
				productName: 'Shawarma Spot Menu',
				reference: 'CSR-00024',
				status: 'new'
			},
			success: true,
			values
		});
		expect(serviceMocks.createCustomSimulationRequest).toHaveBeenCalledWith(
			fetch,
			'valid-token',
			values
		);
	});

	it('returns safe validation errors', async () => {
		serviceMocks.createCustomSimulationRequest.mockRejectedValue(
			new PayloadValidationError('Check the request details and try again.', {
				email: 'Enter a valid email address.'
			})
		);

		const result = await actions.default!(event() as never);

		expect(result).toMatchObject({
			data: {
				errorMessage: 'Check the request details and try again.',
				errors: {
					email: 'Enter a valid email address.'
				},
				success: false,
				values
			},
			status: 400
		});
	});

	it('returns a permission state without exposing upstream details', async () => {
		serviceMocks.createCustomSimulationRequest.mockRejectedValue(
			new PayloadPermissionError('private detail')
		);

		const result = await actions.default!(event() as never);

		expect(result).toMatchObject({
			data: {
				errorMessage: 'You do not have permission to submit this request.',
				errors: {
					form: 'You do not have permission to submit this request.'
				},
				success: false,
				values
			},
			status: 403
		});
	});

	it('redirects unauthenticated direct action submissions to login', async () => {
		const result = await Promise.resolve(
			actions.default!(
				event({
					locals: {
						payloadToken: null,
						user: null
					}
				}) as never
			)
		).catch((cause: unknown) => cause);

		expect(result).toMatchObject({
			location: '/login?returnTo=%2Frequest-simulation',
			status: 303
		});
		expect(serviceMocks.createCustomSimulationRequest).not.toHaveBeenCalled();
	});
});
