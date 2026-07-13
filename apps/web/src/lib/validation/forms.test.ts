import { describe, expect, it } from 'vitest';

import {
	defaultProductFormValues,
	defaultSimulationCreateValues,
	validateProductForm,
	validateSimulationCreateForm
} from './forms';

describe('form validation', () => {
	it('rejects incomplete product creation input and negative prices', () => {
		const result = validateProductForm({
			...defaultProductFormValues,
			currentPrice: '-1',
			name: ''
		});

		expect(result.errors).toMatchObject({
			currentPrice: 'Current price cannot be negative.',
			name: 'Product name is required.'
		});
	});

	it('accepts valid product creation input', () => {
		const result = validateProductForm({
			category: 'Food delivery',
			currency: 'NGN',
			currentPrice: '4200',
			description: 'Menu for delivery customers.',
			name: 'Shawarma Spot Menu',
			status: 'draft',
			targetLocation: 'Lagos, Nigeria',
			targetMarket: 'Urban food delivery customers'
		});

		expect(result.data).toMatchObject({
			currentPrice: 4200,
			name: 'Shawarma Spot Menu'
		});
	});

	it('rejects missing simulation product and invalid customer count', () => {
		const result = validateSimulationCreateForm({
			...defaultSimulationCreateValues,
			customerCount: '0'
		});

		expect(result.errors).toMatchObject({
			customerCount: 'Customer count must be a positive whole number.',
			product: 'Choose a product before creating a simulation.',
			simulationGoal: 'Simulation goal is required.',
			targetAudience: 'Target audience is required.',
			targetLocation: 'Target location is required.',
			title: 'Simulation title is required.'
		});
	});

	it('normalizes simulation segments from comma and newline separated text', () => {
		const result = validateSimulationCreateForm({
			...defaultSimulationCreateValues,
			customerCount: '1000',
			customerSegments: 'Students, Young professionals\nFamilies',
			product: '7',
			simulationGoal: 'Measure price sensitivity.',
			targetAudience: 'Lagos delivery customers',
			targetLocation: 'Lagos, Nigeria',
			title: 'Pricing test'
		});

		expect(result.data?.customerSegments).toEqual(['Students', 'Young professionals', 'Families']);
	});
});
