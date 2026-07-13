import { describe, expect, it, vi } from 'vitest';

import { generateDeterministicRequestSummary } from './deterministic-summary';
import { createRequestSummary } from './request-summary.service';

import type { RequestSummaryInput, RequestSummaryProvider } from './types';

const input: RequestSummaryInput = {
	budget: 150000,
	businessChallenge: 'Delivery fee objections and checkout trust concerns.',
	businessType: 'Food delivery',
	company: 'Amazing Taste Delicacies',
	currency: 'NGN',
	currentPrice: 4200,
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

describe('request summary service', () => {
	it('generates deterministic summaries without AI configuration', async () => {
		const result = await createRequestSummary(input);

		expect(result).toEqual({
			mode: 'deterministic',
			summary: [
				'Business: Amazing Taste Delicacies',
				'Product: Shawarma Spot Menu',
				'Target Market: Lagos food delivery customers',
				'Challenge: Delivery fee objections and checkout trust concerns.',
				'Goal: Test price sensitivity and conversion probability.'
			].join('\n')
		});
	});

	it('falls back to deterministic summary when a future AI provider fails', async () => {
		const provider: RequestSummaryProvider = {
			isConfigured: () => true,
			summarize: vi.fn().mockRejectedValue(new Error('provider unavailable'))
		};

		const result = await createRequestSummary(input, provider);

		expect(result).toEqual(generateDeterministicRequestSummary(input));
		expect(provider.summarize).toHaveBeenCalledWith(input);
	});
});
