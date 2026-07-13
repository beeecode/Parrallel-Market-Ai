import type { CurrencyCode, ProductStatus } from '@parallel-market-ai/shared-types';
import {
	sanitizePlainText,
	validateNonNegativeNumber,
	validatePositiveInteger,
	validateRequiredText
} from '@parallel-market-ai/validation';

import type { ProductFormErrors, ProductFormInput } from '$lib/types/product';
import type { SimulationCreateErrors, SimulationCreateInput } from '$lib/types/simulation-form';

const supportedCurrencies: CurrencyCode[] = ['NGN', 'USD', 'GBP', 'EUR'];
const productStatuses: ProductStatus[] = ['draft', 'active', 'inactive', 'archived'];

export type ValidProductInput = {
	category: string;
	currency: CurrencyCode;
	currentPrice: number;
	description: string;
	name: string;
	status: ProductStatus;
	targetLocation: string;
	targetMarket: string;
};

export type ValidSimulationCreateInput = {
	additionalInstructions?: string;
	competitorContext?: string;
	customerCount: number;
	customerSegments: string[];
	marketConditions?: string;
	pricingStrategy?: string;
	product: number;
	simulationGoal: string;
	targetAudience: string;
	targetLocation: string;
	title: string;
};

export const defaultProductFormValues: ProductFormInput = {
	category: '',
	currency: 'NGN',
	currentPrice: '',
	description: '',
	name: '',
	status: 'draft',
	targetLocation: '',
	targetMarket: ''
};

export const defaultSimulationCreateValues: SimulationCreateInput = {
	additionalInstructions: '',
	competitorContext: '',
	customerCount: '1000',
	customerSegments: '',
	marketConditions: '',
	pricingStrategy: '',
	product: '',
	simulationGoal: '',
	targetAudience: '',
	targetLocation: '',
	title: ''
};

function text(value: FormDataEntryValue | null): string {
	return sanitizePlainText(String(value ?? ''));
}

function parseNumber(value: string): number {
	return value === '' ? Number.NaN : Number(value);
}

function addRequiredTextError(
	errors: Partial<Record<string, string>>,
	key: string,
	value: string,
	label: string,
	maximumLength: number
): void {
	const validation = validateRequiredText(value, label, maximumLength);
	if (!validation.valid) {
		errors[key] = validation.error ?? `${label} is required.`;
	}
}

export function productInputFromFormData(formData: FormData): ProductFormInput {
	const status = text(formData.get('status')) as ProductStatus;
	const currency = text(formData.get('currency')) as CurrencyCode;

	return {
		category: text(formData.get('category')),
		currency: supportedCurrencies.includes(currency) ? currency : 'NGN',
		currentPrice: text(formData.get('currentPrice')),
		description: text(formData.get('description')),
		name: text(formData.get('name')),
		status: productStatuses.includes(status) ? status : 'draft',
		targetLocation: text(formData.get('targetLocation')),
		targetMarket: text(formData.get('targetMarket'))
	};
}

export function validateProductForm(
	input: ProductFormInput
): { data: ValidProductInput; errors?: never } | { data?: never; errors: ProductFormErrors } {
	const errors: ProductFormErrors = {};
	const price = parseNumber(input.currentPrice);

	addRequiredTextError(errors, 'name', input.name, 'Product name', 180);
	addRequiredTextError(errors, 'category', input.category, 'Category', 120);
	addRequiredTextError(errors, 'description', input.description, 'Description', 4_000);
	addRequiredTextError(errors, 'targetMarket', input.targetMarket, 'Target market', 240);
	addRequiredTextError(errors, 'targetLocation', input.targetLocation, 'Target location', 240);

	if (!supportedCurrencies.includes(input.currency)) {
		errors.currency = 'Choose a supported currency.';
	}

	if (!productStatuses.includes(input.status)) {
		errors.status = 'Choose a supported product status.';
	}

	const priceValidation = validateNonNegativeNumber(price, 'Current price');
	if (!Number.isFinite(price) || !priceValidation.valid) {
		errors.currentPrice = priceValidation.error ?? 'Enter a valid current price.';
	}

	if (Object.keys(errors).length > 0) {
		return { errors };
	}

	return {
		data: {
			category: input.category,
			currency: input.currency,
			currentPrice: price,
			description: input.description,
			name: input.name,
			status: input.status,
			targetLocation: input.targetLocation,
			targetMarket: input.targetMarket
		}
	};
}

export function simulationCreateInputFromFormData(formData: FormData): SimulationCreateInput {
	return {
		additionalInstructions: text(formData.get('additionalInstructions')),
		competitorContext: text(formData.get('competitorContext')),
		customerCount: text(formData.get('customerCount')),
		customerSegments: text(formData.get('customerSegments')),
		marketConditions: text(formData.get('marketConditions')),
		pricingStrategy: text(formData.get('pricingStrategy')),
		product: text(formData.get('product')),
		simulationGoal: text(formData.get('simulationGoal')),
		targetAudience: text(formData.get('targetAudience')),
		targetLocation: text(formData.get('targetLocation')),
		title: text(formData.get('title'))
	};
}

function splitSegments(value: string): string[] {
	return value
		.split(/[\n,]/)
		.map((item) => sanitizePlainText(item))
		.filter(Boolean)
		.slice(0, 12);
}

export function validateSimulationCreateForm(
	input: SimulationCreateInput
):
	| { data: ValidSimulationCreateInput; errors?: never }
	| { data?: never; errors: SimulationCreateErrors } {
	const errors: SimulationCreateErrors = {};
	const product = Number(input.product);
	const customerCount = Number(input.customerCount);

	if (!Number.isInteger(product) || product <= 0) {
		errors.product = 'Choose a product before creating a simulation.';
	}

	addRequiredTextError(errors, 'title', input.title, 'Simulation title', 200);
	addRequiredTextError(errors, 'targetAudience', input.targetAudience, 'Target audience', 2_000);
	addRequiredTextError(errors, 'targetLocation', input.targetLocation, 'Target location', 240);
	addRequiredTextError(errors, 'simulationGoal', input.simulationGoal, 'Simulation goal', 2_000);

	const countValidation = validatePositiveInteger(customerCount, 'Customer count');
	if (!countValidation.valid) {
		errors.customerCount = countValidation.error;
	}

	for (const [key, label, maximum] of [
		['marketConditions', 'Market conditions', 2_000],
		['pricingStrategy', 'Pricing strategy', 2_000],
		['competitorContext', 'Competitor context', 2_000],
		['additionalInstructions', 'Additional instructions', 4_000]
	] as const) {
		if (input[key] && input[key].length > maximum) {
			errors[key] = `${label} must be ${maximum.toLocaleString()} characters or fewer.`;
		}
	}

	if (Object.keys(errors).length > 0) {
		return { errors };
	}

	return {
		data: {
			additionalInstructions: input.additionalInstructions || undefined,
			competitorContext: input.competitorContext || undefined,
			customerCount,
			customerSegments: splitSegments(input.customerSegments),
			marketConditions: input.marketConditions || undefined,
			pricingStrategy: input.pricingStrategy || undefined,
			product,
			simulationGoal: input.simulationGoal,
			targetAudience: input.targetAudience,
			targetLocation: input.targetLocation,
			title: input.title
		}
	};
}
