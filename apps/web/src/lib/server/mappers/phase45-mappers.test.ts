import { describe, expect, it } from 'vitest';

import { mapCustomerAgents } from './customer.mapper';
import { mapInsights } from './insight.mapper';
import { mapProductDetail, mapProductList } from './product.mapper';
import type {
	PayloadCustomerAgent,
	PayloadProduct,
	PayloadReport,
	PayloadSimulation
} from '$lib/server/payload/types';

const product: PayloadProduct = {
	category: 'Food delivery',
	currency: 'NGN',
	currentPrice: 4200,
	createdAt: '2024-05-20T09:00:00.000Z',
	description: 'A market-ready shawarma menu.',
	id: 7,
	name: 'Shawarma Spot Menu',
	owner: 4,
	slug: 'shawarma-spot-menu',
	status: 'active',
	targetLocation: 'Lagos, Nigeria',
	targetMarket: 'Urban food delivery customers',
	updatedAt: '2024-05-21T09:00:00.000Z'
};

const simulation: PayloadSimulation = {
	completedAt: '2024-05-20T15:00:00.000Z',
	conversationCount: 100,
	createdAt: '2024-05-20T09:00:00.000Z',
	currency: 'NGN',
	customerCount: 1000,
	id: 10,
	owner: 4,
	product: 7,
	purchaseRate: 23,
	repeatRate: 11,
	revenueMaximum: 6800000,
	revenueMinimum: 4200000,
	status: 'completed',
	successProbability: 72,
	targetAudience: 'Lagos residents',
	targetLocation: 'Lagos, Nigeria',
	title: 'Shawarma Spot Menu',
	updatedAt: '2024-05-21T09:00:00.000Z'
};

const report: PayloadReport = {
	currency: 'NGN',
	currentAveragePrice: 4200,
	customerObjections: [
		{ importance: 'high', label: 'Delivery fee is too high' },
		{ importance: 'medium', label: 'Checkout page is not trusted' }
	],
	executiveSummary: 'Viable with improvements.',
	generatedAt: '2024-05-20T17:00:00.000Z',
	id: 22,
	negativeSentiment: 23,
	neutralSentiment: 28,
	optimalPriceMaximum: 3800,
	optimalPriceMinimum: 3200,
	positiveFeedback: [{ importance: 'high', label: 'Taste and quality of food' }],
	positiveSentiment: 49,
	recommendations: [{ importance: 'high', label: 'Offer smaller portions' }],
	revenueMaximum: 6800000,
	revenueMinimum: 4200000,
	riskFactors: [{ importance: 'high', label: 'Checkout trust appears weak' }],
	simulation: 10,
	status: 'completed',
	successProbability: 72,
	version: 1
};

describe('Phase 4.5 mappers', () => {
	it('maps product list rows with simulation counts', () => {
		const result = mapProductList([product], [simulation], { status: 'all' });

		expect(result.products[0]).toMatchObject({
			name: 'Shawarma Spot Menu',
			simulationCount: 1,
			statusLabel: 'Active'
		});
	});

	it('maps product detail related simulation links', () => {
		const result = mapProductDetail(product, [simulation]);

		expect(result.createSimulationHref).toBe('/simulations/new?product=7');
		expect(result.relatedSimulations[0].href).toBe('/simulations/10/live');
	});

	it('maps customer agents from populated simulation data', () => {
		const agent: PayloadCustomerAgent = {
			age: 28,
			communicationStyle: 'Direct and price-aware',
			createdAt: '2024-05-20T10:00:00.000Z',
			id: 31,
			incomeLevel: 'Middle income',
			location: 'Yaba',
			name: 'Bola',
			occupation: 'Product designer',
			priceSensitivity: 'high',
			simulation: {
				id: 10,
				status: 'completed',
				title: 'Shawarma Spot Menu'
			}
		};

		const result = mapCustomerAgents([agent], { priceSensitivity: 'all', simulationId: 'all' });

		expect(result.customers[0]).toMatchObject({
			name: 'Bola',
			priceSensitivityLabel: 'High',
			relatedSimulation: { title: 'Shawarma Spot Menu' }
		});
	});

	it('derives insights only from report records', () => {
		const result = mapInsights([report]);

		expect(result?.cards.map((card) => card.title)).toContain('Pricing Insight');
		expect(result?.recommendations).toContain('Offer smaller portions');
		expect(result?.riskFactors).toContain('Checkout trust appears weak');
	});

	it('returns an empty insights state when there are no reports', () => {
		expect(mapInsights([])).toBeNull();
	});
});
