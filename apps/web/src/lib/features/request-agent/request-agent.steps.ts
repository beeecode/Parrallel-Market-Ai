import type { CurrencyCode } from '@parallel-market-ai/shared-types';
import type { RequestAgentStep } from '$lib/types/request-agent';

export const requestCurrencyOptions: Array<{ label: string; value: CurrencyCode }> = [
	{ label: 'Nigerian Naira (NGN)', value: 'NGN' },
	{ label: 'United States Dollar (USD)', value: 'USD' },
	{ label: 'British Pound (GBP)', value: 'GBP' },
	{ label: 'Euro (EUR)', value: 'EUR' }
];

export const requestAgentSteps: RequestAgentStep[] = [
	{
		field: 'customerName',
		group: 'contact',
		inputKind: 'text',
		maxLength: 160,
		placeholder: 'Daniel Adeyemi',
		question: 'Who should we contact about this custom simulation?',
		title: 'Your name'
	},
	{
		field: 'email',
		group: 'contact',
		inputKind: 'email',
		maxLength: 180,
		placeholder: 'you@company.com',
		question: 'What email should we use for request updates?',
		title: 'Email address'
	},
	{
		field: 'company',
		group: 'business',
		inputKind: 'text',
		maxLength: 160,
		placeholder: 'Amazing Taste Delicacies',
		question: 'What company or business is this request for?',
		title: 'Company'
	},
	{
		field: 'businessType',
		group: 'business',
		inputKind: 'text',
		maxLength: 160,
		placeholder: 'Food delivery, tutoring, grocery commerce...',
		question: 'What type of business are we simulating?',
		title: 'Business type'
	},
	{
		field: 'productName',
		group: 'product',
		inputKind: 'text',
		maxLength: 160,
		placeholder: 'Shawarma Spot Menu',
		question: 'What product or service should the simulation focus on?',
		title: 'Product or service'
	},
	{
		field: 'productDescription',
		group: 'product',
		helper: 'Mention the offer, package, delivery model, or what makes it different.',
		inputKind: 'textarea',
		maxLength: 4000,
		placeholder:
			'A premium shawarma menu for mobile-first ordering, WhatsApp commerce, and lunch delivery.',
		question: 'Describe the product or service in a few practical details.',
		title: 'Product description'
	},
	{
		field: 'targetMarket',
		group: 'market',
		inputKind: 'text',
		maxLength: 1000,
		placeholder: 'Lagos food delivery customers',
		question: 'Which market or buyer segment should we test?',
		title: 'Target market'
	},
	{
		field: 'targetLocation',
		group: 'market',
		inputKind: 'text',
		maxLength: 1000,
		placeholder: 'Lagos, Nigeria',
		question: 'Where should the simulation focus geographically?',
		title: 'Target location'
	},
	{
		field: 'targetCustomers',
		group: 'market',
		helper: 'Examples: students, parents, office workers, market traders, SMEs.',
		inputKind: 'textarea',
		maxLength: 1000,
		placeholder: 'Young professionals and students who order lunch online.',
		question: 'Who are the customers we should model?',
		title: 'Target customers'
	},
	{
		field: 'currentPrice',
		group: 'pricing',
		helper: 'Use numbers only. You can choose the currency next.',
		inputKind: 'number',
		placeholder: '4200',
		question: 'What is the current average price?',
		title: 'Current price'
	},
	{
		field: 'currency',
		group: 'pricing',
		inputKind: 'select',
		options: requestCurrencyOptions,
		placeholder: 'Choose currency',
		question: 'Which currency should we use for pricing and budget?',
		title: 'Currency'
	},
	{
		field: 'businessChallenge',
		group: 'strategy',
		helper: 'Tell us what is blocking growth, trust, conversion, pricing, or adoption.',
		inputKind: 'textarea',
		maxLength: 4000,
		placeholder: 'Delivery fee objections, price sensitivity, and checkout trust concerns.',
		question: 'What business challenge should this simulation help answer?',
		title: 'Business challenge'
	},
	{
		field: 'simulationGoal',
		group: 'strategy',
		helper: 'Describe the decision you want the simulation to support.',
		inputKind: 'textarea',
		maxLength: 4000,
		placeholder: 'Test price sensitivity and conversion probability before changing the offer.',
		question: 'What outcome do you expect from the simulation?',
		title: 'Simulation goal'
	},
	{
		field: 'budget',
		group: 'pricing',
		helper: 'Use a rough numeric budget so the team can scope the request.',
		inputKind: 'number',
		placeholder: '150000',
		question: 'What budget range should we keep in mind?',
		title: 'Budget'
	},
	{
		field: 'timeline',
		group: 'strategy',
		inputKind: 'text',
		maxLength: 1000,
		placeholder: 'This month, before next launch, within 2 weeks...',
		question: 'When do you need this reviewed?',
		title: 'Timeline'
	}
];
