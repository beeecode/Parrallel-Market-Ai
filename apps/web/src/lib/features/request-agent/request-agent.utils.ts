import type { AuthenticatedUser } from '$lib/types/auth';
import type {
	RequestAgentErrors,
	RequestAgentField,
	RequestAgentStep,
	RequestAgentValues,
	RequestReviewSection,
	ValidCustomSimulationRequestInput
} from '$lib/types/request-agent';
import type { CurrencyCode } from '@parallel-market-ai/shared-types';
import {
	sanitizePlainText,
	validateEmail,
	validateNonNegativeNumber,
	validateRequiredText
} from '@parallel-market-ai/validation';

import { requestAgentSteps, requestCurrencyOptions } from './request-agent.steps';

const supportedCurrencies = requestCurrencyOptions.map((option) => option.value);
const requestFieldLabels: Record<RequestAgentField, string> = {
	budget: 'Budget',
	businessChallenge: 'Business challenge',
	businessType: 'Business type',
	company: 'Company',
	currency: 'Currency',
	currentPrice: 'Current price',
	customerName: 'Customer name',
	email: 'Email address',
	productDescription: 'Product description',
	productName: 'Product or service',
	simulationGoal: 'Simulation goal',
	targetCustomers: 'Target customers',
	targetLocation: 'Target location',
	targetMarket: 'Target market',
	timeline: 'Timeline'
};

export function defaultRequestAgentValues(user?: AuthenticatedUser | null): RequestAgentValues {
	return {
		budget: '',
		businessChallenge: '',
		businessType: '',
		company: user?.company ?? '',
		currency: 'NGN',
		currentPrice: '',
		customerName: user?.name ?? '',
		email: user?.email ?? '',
		productDescription: '',
		productName: '',
		simulationGoal: '',
		targetCustomers: '',
		targetLocation: '',
		targetMarket: '',
		timeline: ''
	};
}

export function requestAgentValuesFromFormData(formData: FormData): RequestAgentValues {
	return requestAgentSteps.reduce<RequestAgentValues>((values, step) => {
		values[step.field] = sanitizePlainText(String(formData.get(step.field) ?? ''));
		return values;
	}, defaultRequestAgentValues());
}

function numberFromText(value: string): number {
	return value === '' ? Number.NaN : Number(value);
}

function addRequiredTextError(
	errors: RequestAgentErrors,
	field: RequestAgentField,
	value: string,
	label: string,
	maximumLength: number
): void {
	const validation = validateRequiredText(value, label, maximumLength);
	if (!validation.valid) {
		errors[field] = validation.error;
	}
}

function validateNumberField(
	errors: RequestAgentErrors,
	field: 'budget' | 'currentPrice',
	value: string
): number {
	const parsed = numberFromText(value);
	const label = requestFieldLabels[field];

	if (!value.trim()) {
		errors[field] = `${label} is required.`;
		return parsed;
	}

	const validation = validateNonNegativeNumber(parsed, label);
	if (!Number.isFinite(parsed) || !validation.valid) {
		errors[field] = validation.error ?? `Enter a valid ${label.toLowerCase()}.`;
	}

	return parsed;
}

export function validateRequestAgentValues(
	values: RequestAgentValues
):
	| { data: ValidCustomSimulationRequestInput; errors?: never }
	| { data?: never; errors: RequestAgentErrors } {
	const errors: RequestAgentErrors = {};

	for (const step of requestAgentSteps) {
		if (step.field === 'currency' || step.field === 'currentPrice' || step.field === 'budget') {
			continue;
		}

		addRequiredTextError(
			errors,
			step.field,
			values[step.field],
			requestFieldLabels[step.field],
			step.maxLength ?? 1000
		);
	}

	const emailValidation = validateEmail(values.email);
	if (!emailValidation.valid) {
		errors.email = emailValidation.error;
	}

	if (!supportedCurrencies.includes(values.currency as CurrencyCode)) {
		errors.currency = 'Choose a supported currency.';
	}

	const currentPrice = validateNumberField(errors, 'currentPrice', values.currentPrice);
	const budget = validateNumberField(errors, 'budget', values.budget);

	if (Object.keys(errors).length > 0) {
		return { errors };
	}

	return {
		data: {
			budget,
			businessChallenge: values.businessChallenge,
			businessType: values.businessType,
			company: values.company,
			currency: values.currency as CurrencyCode,
			currentPrice,
			customerName: values.customerName,
			email: values.email,
			productDescription: values.productDescription,
			productName: values.productName,
			simulationGoal: values.simulationGoal,
			targetCustomers: values.targetCustomers,
			targetLocation: values.targetLocation,
			targetMarket: values.targetMarket,
			timeline: values.timeline
		}
	};
}

export function validateRequestAgentStep(
	step: RequestAgentStep,
	values: RequestAgentValues
): string | undefined {
	const result = validateRequestAgentValues(values);
	if ('data' in result) return undefined;
	return result.errors[step.field];
}

export function answeredRequestStepCount(values: RequestAgentValues): number {
	return requestAgentSteps.filter((step) => Boolean(values[step.field]?.trim())).length;
}

export function requestProgressPercentage(values: RequestAgentValues): number {
	return Math.round((answeredRequestStepCount(values) / requestAgentSteps.length) * 100);
}

export function formatRequestAnswer(field: RequestAgentField, value: string): string {
	if (!value) return 'Not answered';
	if (field === 'currentPrice' || field === 'budget') {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed.toLocaleString('en-NG') : value;
	}
	return value;
}

export function reviewSectionsFromValues(values: RequestAgentValues): RequestReviewSection[] {
	return [
		{
			title: 'Customer details',
			items: [
				{ field: 'customerName', label: 'Name', value: values.customerName },
				{ field: 'email', label: 'Email', value: values.email }
			]
		},
		{
			title: 'Company details',
			items: [
				{ field: 'company', label: 'Company', value: values.company },
				{ field: 'businessType', label: 'Business type', value: values.businessType }
			]
		},
		{
			title: 'Product or service',
			items: [
				{ field: 'productName', label: 'Name', value: values.productName },
				{ field: 'productDescription', label: 'Description', value: values.productDescription }
			]
		},
		{
			title: 'Market focus',
			items: [
				{ field: 'targetMarket', label: 'Target market', value: values.targetMarket },
				{ field: 'targetLocation', label: 'Target location', value: values.targetLocation },
				{ field: 'targetCustomers', label: 'Target customers', value: values.targetCustomers }
			]
		},
		{
			title: 'Pricing and scope',
			items: [
				{
					field: 'currentPrice',
					label: 'Current price',
					value: `${values.currency} ${formatRequestAnswer('currentPrice', values.currentPrice)}`
				},
				{
					field: 'budget',
					label: 'Budget',
					value: `${values.currency} ${formatRequestAnswer('budget', values.budget)}`
				},
				{ field: 'timeline', label: 'Timeline', value: values.timeline }
			]
		},
		{
			title: 'Simulation focus',
			items: [
				{ field: 'businessChallenge', label: 'Challenge', value: values.businessChallenge },
				{ field: 'simulationGoal', label: 'Goal', value: values.simulationGoal }
			]
		}
	];
}

export function deterministicSummaryPreview(values: RequestAgentValues): string {
	return [
		`Business: ${values.company || 'Not provided'}`,
		`Product: ${values.productName || 'Not provided'}`,
		`Target Market: ${values.targetMarket || 'Not provided'}`,
		`Challenge: ${values.businessChallenge || 'Not provided'}`,
		`Goal: ${values.simulationGoal || 'Not provided'}`
	].join('\n');
}
