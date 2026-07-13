import { describe, expect, it, vi } from 'vitest';

import { PayloadValidationError } from '$lib/server/payload/errors';
import { createProduct } from './products.service';
import { createSimulation } from './simulation-create.service';

function listResponse(docs: unknown[]): Response {
	return new Response(
		JSON.stringify({
			docs,
			hasNextPage: false,
			hasPrevPage: false,
			limit: docs.length || 1,
			nextPage: null,
			page: 1,
			pagingCounter: 1,
			prevPage: null,
			totalDocs: docs.length,
			totalPages: docs.length ? 1 : 0
		}),
		{ status: 200 }
	);
}

function documentResponse(doc: unknown): Response {
	return new Response(JSON.stringify({ doc }), { status: 201 });
}

function asFetch(mock: ReturnType<typeof vi.fn>): typeof globalThis.fetch {
	return mock as unknown as typeof globalThis.fetch;
}

const user = {
	email: 'owner@example.com',
	id: 4,
	name: 'Demo Owner',
	role: 'business-owner' as const
};

const productDoc = {
	category: 'Food delivery',
	currency: 'NGN',
	currentPrice: 4200,
	createdAt: '2024-05-20T09:00:00.000Z',
	description: 'A market-ready shawarma menu.',
	id: 7,
	name: 'Shawarma Spot Menu',
	owner: 4,
	slug: 'shawarma-spot-menu',
	status: 'draft',
	targetLocation: 'Lagos, Nigeria',
	targetMarket: 'Urban food delivery customers',
	updatedAt: '2024-05-20T09:00:00.000Z'
};

describe('Phase 4.5 services', () => {
	it('rejects invalid product creation before calling Payload', async () => {
		const fetchMock = vi.fn();

		await expect(
			createProduct(asFetch(fetchMock), 'token', user, {
				category: '',
				currency: 'NGN',
				currentPrice: '-10',
				description: '',
				name: '',
				status: 'draft',
				targetLocation: '',
				targetMarket: ''
			})
		).rejects.toBeInstanceOf(PayloadValidationError);

		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('creates products through Payload with the authenticated owner', async () => {
		const fetchMock = vi.fn().mockResolvedValueOnce(documentResponse(productDoc));

		const result = await createProduct(asFetch(fetchMock), 'token', user, {
			category: 'Food delivery',
			currency: 'NGN',
			currentPrice: '4200',
			description: 'A market-ready shawarma menu.',
			name: 'Shawarma Spot Menu',
			status: 'draft',
			targetLocation: 'Lagos, Nigeria',
			targetMarket: 'Urban food delivery customers'
		});

		expect(result.id).toBe('7');
		expect(String(fetchMock.mock.calls[0][1].body)).toContain('"owner":4');
	});

	it('rejects invalid simulation creation before resolving products', async () => {
		const fetchMock = vi.fn();

		await expect(
			createSimulation(asFetch(fetchMock), 'token', user, {
				additionalInstructions: '',
				competitorContext: '',
				customerCount: '0',
				customerSegments: '',
				marketConditions: '',
				pricingStrategy: '',
				product: '',
				simulationGoal: '',
				targetAudience: '',
				targetLocation: '',
				title: ''
			})
		).rejects.toBeInstanceOf(PayloadValidationError);

		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('creates simulations as draft records for accessible products', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(listResponse([productDoc]))
			.mockResolvedValueOnce(
				documentResponse({
					completedAt: null,
					conversationCount: 0,
					createdAt: '2024-05-20T09:00:00.000Z',
					currency: 'NGN',
					customerCount: 1000,
					id: 99,
					owner: 4,
					product: 7,
					status: 'draft',
					targetAudience: 'Lagos delivery customers',
					targetLocation: 'Lagos, Nigeria',
					title: 'Draft simulation',
					updatedAt: '2024-05-20T09:00:00.000Z'
				})
			);

		const result = await createSimulation(asFetch(fetchMock), 'token', user, {
			additionalInstructions: '',
			competitorContext: '',
			customerCount: '1000',
			customerSegments: 'Students, Families',
			marketConditions: '',
			pricingStrategy: '',
			product: '7',
			simulationGoal: 'Measure purchase intent.',
			targetAudience: 'Lagos delivery customers',
			targetLocation: 'Lagos, Nigeria',
			title: 'Draft simulation'
		});

		expect(result.id).toBe('99');
		const body = String(fetchMock.mock.calls[1][1].body);
		expect(body).toContain('"status":"draft"');
		expect(body).toContain('"customerSegments":[{"segment":"Students"},{"segment":"Families"}]');
	});
});
