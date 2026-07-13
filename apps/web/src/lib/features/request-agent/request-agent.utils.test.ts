import { describe, expect, it } from 'vitest';

import { requestAgentSteps } from './request-agent.steps';
import {
	defaultRequestAgentValues,
	deterministicSummaryPreview,
	requestProgressPercentage,
	reviewSectionsFromValues,
	validateRequestAgentStep,
	validateRequestAgentValues
} from './request-agent.utils';
import {
	firstIncompleteRequestStep,
	nextRequestStepIndex,
	previousRequestStepIndex
} from './request-agent.store';

import type { RequestAgentValues } from '$lib/types/request-agent';

const validValues: RequestAgentValues = {
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

describe('request-agent helpers', () => {
	it('prefills safe user contact fields', () => {
		const values = defaultRequestAgentValues({
			company: 'Demo Company',
			email: 'owner@example.com',
			id: 7,
			name: 'Demo Owner',
			role: 'business-owner'
		});

		expect(values).toMatchObject({
			company: 'Demo Company',
			customerName: 'Demo Owner',
			email: 'owner@example.com'
		});
	});

	it('validates a complete request and parses numeric fields', () => {
		const result = validateRequestAgentValues(validValues);

		expect(result.data).toMatchObject({
			budget: 150000,
			currentPrice: 4200,
			productName: 'Shawarma Spot Menu'
		});
	});

	it('rejects invalid email, empty required text, negative price, and unsupported currency', () => {
		const result = validateRequestAgentValues({
			...validValues,
			businessChallenge: '   ',
			currency: 'BTC',
			currentPrice: '-1',
			email: 'not-an-email'
		});

		expect(result.errors).toMatchObject({
			businessChallenge: 'Business challenge is required.',
			currency: 'Choose a supported currency.',
			currentPrice: 'Current price cannot be negative.',
			email: 'Enter a valid email address.'
		});
	});

	it('rejects excessive text length on step validation', () => {
		const step = requestAgentSteps.find((item) => item.field === 'productDescription');
		expect(step).toBeDefined();

		const result = validateRequestAgentStep(step!, {
			...validValues,
			productDescription: 'x'.repeat(4001)
		});

		expect(result).toBe('Product description must be 4,000 characters or fewer.');
	});

	it('supports step progression, back navigation, progress, and review generation', () => {
		expect(firstIncompleteRequestStep({ ...validValues, productName: '' })).toBe(4);
		expect(nextRequestStepIndex(2)).toBe(3);
		expect(previousRequestStepIndex(2)).toBe(1);
		expect(requestProgressPercentage(validValues)).toBe(100);

		const sections = reviewSectionsFromValues(validValues);
		expect(sections.map((section) => section.title)).toContain('Simulation focus');
		expect(deterministicSummaryPreview(validValues)).toContain('Product: Shawarma Spot Menu');
	});
});
