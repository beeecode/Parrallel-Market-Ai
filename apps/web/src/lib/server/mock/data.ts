import type { CurrencyCode, ProductStatus } from '@parallel-market-ai/shared-types';

import type { AuthenticatedUser } from '$lib/types/auth';
import type { CustomerAgentListViewModel } from '$lib/types/customer';
import type { DashboardViewModel } from '$lib/types/dashboard';
import type { InsightDashboardViewModel } from '$lib/types/insight';
import type {
	ProductDetailViewModel,
	ProductListFilters,
	ProductListItem,
	ProductListViewModel,
	ProductRelatedSimulation
} from '$lib/types/product';
import type { ReportViewModel } from '$lib/types/report';
import type { ChatMessageViewModel, SimulationWorkspaceViewModel } from '$lib/types/simulation';
import type { SimulationCreateViewModel } from '$lib/types/simulation-form';
import { defaultSimulationCreateValues } from '$lib/validation/forms';

export const mockAuthenticatedUser: AuthenticatedUser = {
	id: 1,
	name: 'Daniel Adeyemi',
	email: 'demo-owner@parallel-market-ai.local',
	role: 'business-owner',
	company: 'Parallel Market Demo Ventures',
	avatarUrl: '/assets/2d/avatars/person.svg'
};

const productStatusOptions: ProductListViewModel['statusOptions'] = [
	{ label: 'All statuses', value: 'all' },
	{ label: 'Draft', value: 'draft' },
	{ label: 'Active', value: 'active' },
	{ label: 'Inactive', value: 'inactive' },
	{ label: 'Archived', value: 'archived' }
];

const priceSensitivityOptions: CustomerAgentListViewModel['priceSensitivityOptions'] = [
	{ label: 'All sensitivities', value: 'all' },
	{ label: 'Low', value: 'low' },
	{ label: 'Moderate', value: 'moderate' },
	{ label: 'High', value: 'high' },
	{ label: 'Very high', value: 'very-high' }
];

const relatedSimulations: ProductRelatedSimulation[] = [
	{
		href: '/simulations/1/live',
		id: '1',
		status: 'completed',
		statusLabel: 'Completed',
		successProbability: '72%',
		title: 'Shawarma Spot Menu',
		updatedAt: 'May 20, 2024'
	}
];

const products: ProductDetailViewModel[] = [
	{
		category: 'Food delivery',
		createSimulationHref: '/simulations/new?product=1',
		createdAt: 'May 12, 2024',
		currency: 'NGN',
		currentPrice: '\u20a64,200',
		description:
			'A premium shawarma menu designed for mobile-first ordering, WhatsApp commerce, and urban lunch delivery.',
		id: '1',
		name: 'Shawarma Spot Menu',
		relatedSimulations,
		status: 'active',
		statusLabel: 'Active',
		targetLocation: 'Lagos, Nigeria',
		targetMarket: 'Young professionals and students ordering lunch online',
		updatedAt: 'May 20, 2024'
	},
	{
		category: 'Grocery delivery',
		createSimulationHref: '/simulations/new?product=2',
		createdAt: 'May 10, 2024',
		currency: 'NGN',
		currentPrice: '\u20a62,900',
		description: 'A same-day fresh produce and grocery delivery app for busy households in Abuja.',
		id: '2',
		name: 'FreshFarm Delivery App',
		relatedSimulations: [
			{
				href: '/simulations/2/live',
				id: '2',
				status: 'completed',
				statusLabel: 'Completed',
				successProbability: '61%',
				title: 'FreshFarm Delivery App',
				updatedAt: 'May 18, 2024'
			}
		],
		status: 'active',
		statusLabel: 'Active',
		targetLocation: 'Abuja, Nigeria',
		targetMarket: 'Families and professionals buying weekly groceries',
		updatedAt: 'May 18, 2024'
	},
	{
		category: 'Education',
		createSimulationHref: '/simulations/new?product=3',
		createdAt: 'May 8, 2024',
		currency: 'NGN',
		currentPrice: '\u20a615,000',
		description: 'Online tutoring subscriptions for secondary-school students preparing for exams.',
		id: '3',
		name: 'StudyBuddy Online Tutoring',
		relatedSimulations: [
			{
				href: '/simulations/3/live',
				id: '3',
				status: 'completed',
				statusLabel: 'Completed',
				successProbability: '48%',
				title: 'StudyBuddy Online Tutoring',
				updatedAt: 'May 15, 2024'
			}
		],
		status: 'draft',
		statusLabel: 'Draft',
		targetLocation: 'Lagos, Nigeria',
		targetMarket: 'Parents and exam-focused students',
		updatedAt: 'May 15, 2024'
	},
	{
		category: 'Preview product',
		createSimulationHref: '/simulations/new?product=101',
		createdAt: 'Today',
		currency: 'NGN',
		currentPrice: '\u20a64,200',
		description:
			'This mock detail page previews how a newly created product will look before it is saved to Payload.',
		id: '101',
		name: 'Mock Product Preview',
		relatedSimulations: [],
		status: 'draft',
		statusLabel: 'Draft',
		targetLocation: 'Lagos, Nigeria',
		targetMarket: 'Preview customers',
		updatedAt: 'Today'
	}
];

function statusTone(status: ProductStatus): ProductListItem['statusTone'] {
	if (status === 'active') return 'success';
	if (status === 'inactive') return 'warning';
	if (status === 'archived') return 'neutral';
	return 'purple';
}

function matchesSearch(product: ProductDetailViewModel, search?: string): boolean {
	if (!search) return true;
	const query = search.toLowerCase();
	return [product.name, product.category, product.targetMarket, product.targetLocation].some(
		(value) => value.toLowerCase().includes(query)
	);
}

export function getMockDashboardData(): DashboardViewModel {
	return {
		activity: [
			{
				date: 'May 20, 2024',
				id: 1,
				revenueForecast: '\u20a64.2M - \u20a66.8M',
				simulation: 'Shawarma Spot Menu',
				status: 'Completed',
				successScore: '72%',
				targetMarket: 'Lagos, Nigeria'
			},
			{
				date: 'May 18, 2024',
				id: 2,
				revenueForecast: '\u20a62.1M - \u20a63.7M',
				simulation: 'FreshFarm Delivery App',
				status: 'Completed',
				successScore: '61%',
				targetMarket: 'Abuja, Nigeria'
			},
			{
				date: 'May 15, 2024',
				id: 3,
				revenueForecast: '\u20a61.2M - \u20a62.5M',
				simulation: 'StudyBuddy Online Tutoring',
				status: 'Completed',
				successScore: '48%',
				targetMarket: 'Lagos, Nigeria'
			}
		],
		metrics: [
			{
				iconAlt: 'Customer avatar',
				iconSrc: '/assets/3d/avatars/person.png',
				label: 'Total Customers Simulated',
				tone: 'neutral',
				value: '1,000'
			},
			{
				iconAlt: 'Conversation icon',
				iconSrc: '/assets/3d/icons/chat-bubble.png',
				label: 'Total Conversations',
				tone: 'primary',
				value: '3,842'
			},
			{
				iconAlt: 'Purchase icon',
				iconSrc: '/assets/3d/illustrations/money-bag.png',
				label: 'Purchase Rate',
				tone: 'primary',
				value: '23.7%'
			},
			{
				iconAlt: 'Repeat rate icon',
				iconSrc: '/assets/3d/illustrations/rocket.png',
				label: 'Repeat Rate',
				tone: 'primary',
				value: '11.3%'
			}
		],
		revenueForecast: '\u20a64.2M - \u20a66.8M',
		revenueSubtitle: 'Expected Monthly Revenue',
		revenueTrend: [18, 22, 19, 27, 23, 25, 31, 26, 30, 28, 36],
		successCopy: 'Your business is likely to succeed in this market with the right changes.',
		successProbability: 72
	};
}

export function getMockProductsData(filters: ProductListFilters): ProductListViewModel {
	const filtered = products
		.filter((product) => product.id !== '101')
		.filter(
			(product) => !filters.status || filters.status === 'all' || product.status === filters.status
		)
		.filter((product) => !filters.category || product.category === filters.category)
		.filter((product) => matchesSearch(product, filters.search));

	return {
		categories: [
			...new Set(
				products.filter((product) => product.id !== '101').map((product) => product.category)
			)
		].sort((left, right) => left.localeCompare(right)),
		filters,
		products: filtered.map((product) => ({
			category: product.category,
			currency: product.currency,
			currentPrice: product.currentPrice,
			href: `/products/${product.id}`,
			id: product.id,
			name: product.name,
			simulationCount: product.relatedSimulations.length,
			status: product.status,
			statusLabel: product.statusLabel,
			statusTone: statusTone(product.status),
			targetLocation: product.targetLocation,
			targetMarket: product.targetMarket,
			updatedAt: product.updatedAt
		})),
		statusOptions: productStatusOptions,
		total: filtered.length
	};
}

export function getMockProductDetailData(productId: number): ProductDetailViewModel | null {
	return products.find((product) => product.id === String(productId)) ?? null;
}

export function getMockSimulationCreateData(selectedProductId?: number): SimulationCreateViewModel {
	return {
		productOptions: products
			.filter((product) => product.status !== 'archived')
			.map((product) => ({
				category: product.category,
				currency: product.currency as CurrencyCode,
				currentPrice: product.currentPrice,
				id: product.id,
				name: product.name,
				targetLocation: product.targetLocation,
				targetMarket: product.targetMarket
			})),
		values: {
			...defaultSimulationCreateValues,
			product: selectedProductId ? String(selectedProductId) : ''
		}
	};
}

export function getMockSimulationWorkspace(
	simulationId?: number
): SimulationWorkspaceViewModel | null {
	if (simulationId === 101) {
		return {
			activeAgentId: '',
			activity: [],
			agents: [],
			elapsedTime: '00:00:00',
			messagesByAgent: {},
			simulationId: '101',
			stats: [
				{ detail: 'Saved for later configuration', label: 'Status', value: 'Draft' },
				{
					detail: 'Agents are generated by the future simulation engine',
					label: 'Agents',
					value: '0'
				}
			],
			status: 'Draft',
			title: 'Live Simulation - Draft Simulation Preview'
		};
	}

	return {
		activeAgentId: '1',
		activity: [
			{
				description: 'Ada flagged delivery fee and menu prices as too high.',
				id: 'activity-1',
				timestamp: '12:31 PM',
				title: 'Price objection detected',
				tone: 'warning'
			},
			{
				description: 'Tunde accepted delivery after a conditional discount.',
				id: 'activity-2',
				timestamp: '12:32 PM',
				title: 'Conversion intent increased',
				tone: 'success'
			},
			{
				description: 'Zainab asked for checkout proof and delivery assurance.',
				id: 'activity-3',
				timestamp: '12:34 PM',
				title: 'Trust signal requested',
				tone: 'neutral'
			}
		],
		agents: [
			{
				accent: '#8b5cf6',
				age: 24,
				avatarAlt: 'Tunde customer avatar',
				avatarSrc: '/assets/2d/avatars/man.svg',
				conversationId: '101',
				id: '1',
				lastSeen: '12:30 PM',
				name: 'Tunde',
				preview: 'Is delivery available to Yaba?'
			},
			{
				accent: '#f59e0b',
				age: 28,
				avatarAlt: 'Bola customer avatar',
				avatarSrc: '/assets/2d/avatars/woman.svg',
				conversationId: '102',
				id: '2',
				lastSeen: '12:30 PM',
				name: 'Bola',
				preview: 'Do you have small pack?'
			},
			{
				accent: '#fb923c',
				age: 21,
				avatarAlt: 'Ada customer avatar',
				avatarSrc: '/assets/2d/avatars/girl.svg',
				conversationId: '103',
				id: '3',
				lastSeen: '12:29 PM',
				name: 'Ada',
				preview: 'Your prices are a bit high o'
			},
			{
				accent: '#facc15',
				age: 30,
				avatarAlt: 'Emeka customer avatar',
				avatarSrc: '/assets/2d/avatars/boy.svg',
				conversationId: '104',
				id: '4',
				lastSeen: '12:28 PM',
				name: 'Emeka',
				preview: 'How long does delivery take?'
			},
			{
				accent: '#60a5fa',
				age: 26,
				avatarAlt: 'Zainab customer avatar',
				avatarSrc: '/assets/2d/avatars/woman-technologist.svg',
				conversationId: '105',
				id: '5',
				lastSeen: '12:27 PM',
				name: 'Zainab',
				preview: 'Do you have discounts?'
			},
			{
				accent: '#f97316',
				age: 27,
				avatarAlt: 'Musa customer avatar',
				avatarSrc: '/assets/2d/avatars/person.svg',
				conversationId: '106',
				id: '6',
				lastSeen: '12:27 PM',
				name: 'Musa',
				preview: 'I prefer chicken over beef'
			}
		],
		elapsedTime: '02:15:43',
		messagesByAgent: {
			'1': [
				{
					body: 'Is delivery available to Yaba?',
					id: 'message-1',
					sender: 'business',
					sentAt: '2024-05-20T12:30:00.000Z',
					timestamp: '12:30 PM'
				},
				{
					body: 'Yes o! Delivery to Yaba is available for just \u20a6800.',
					id: 'message-2',
					sender: 'customer',
					sentAt: '2024-05-20T12:30:30.000Z',
					timestamp: '12:30 PM'
				},
				{
					body: "That's a bit high. Can you reduce it?",
					id: 'message-3',
					sender: 'business',
					sentAt: '2024-05-20T12:31:00.000Z',
					timestamp: '12:31 PM'
				},
				{
					body: 'We can do \u20a6500 if your order is above \u20a64,000',
					id: 'message-4',
					sender: 'customer',
					sentAt: '2024-05-20T12:31:30.000Z',
					timestamp: '12:31 PM'
				}
			],
			'2': [
				{
					body: 'Do you have a smaller pack?',
					id: 'message-5',
					sender: 'customer',
					sentAt: '2024-05-20T12:30:00.000Z',
					timestamp: '12:30 PM'
				}
			],
			'3': [],
			'4': [],
			'5': [],
			'6': []
		},
		simulationId: String(simulationId ?? 1),
		stats: [
			{ detail: 'Across Lagos food buyer segments', label: 'Agents Active', value: '6' },
			{
				detail: 'Chat, objections, and intent signals',
				label: 'Messages Captured',
				value: '3,842'
			},
			{ detail: 'Likely to buy after offer changes', label: 'Purchase Intent', value: '23.7%' },
			{ detail: 'Mostly delivery and checkout trust', label: 'Objection Rate', value: '31%' }
		],
		status: 'Running',
		title: 'Live Simulation - Shawarma Spot Menu'
	};
}

export function getMockReportData(): ReportViewModel {
	return {
		currentAveragePrice: '\u20a64,200',
		id: '1',
		objections: [
			{ label: 'Delivery fee too high' },
			{ label: 'Prices slightly expensive' },
			{ label: 'Checkout page not trusted' }
		],
		optimalPriceRange: '\u20a63,200 - \u20a63,800',
		positiveFeedback: [
			{ label: 'Taste and quality of food' },
			{ label: 'Packaging is good' },
			{ label: 'Variety of options' }
		],
		recommendations: [
			{ label: 'Add WhatsApp ordering' },
			{ label: 'Offer smaller portions' },
			{ label: 'Build trust signals' }
		],
		revenueForecast: '\u20a64.2M - \u20a66.8M',
		risks: [
			{ label: 'Delivery fee is too high' },
			{ label: 'Checkout is not trusted' },
			{ label: 'Price is slightly high' }
		],
		sentiment: [
			{ color: '#65d88c', label: 'Positive', value: 49 },
			{ color: '#f8c96a', label: 'Neutral', value: 28 },
			{ color: '#fb7185', label: 'Negative', value: 23 }
		],
		simulationId: '1',
		status: 'Completed',
		successLabel: 'Viable with improvements',
		successProbability: 72,
		title: 'Simulation Report - Shawarma Spot Menu'
	};
}

export function getMockCustomersData(
	filters: CustomerAgentListViewModel['filters']
): CustomerAgentListViewModel {
	const allCustomers: CustomerAgentListViewModel['customers'] = [
		['1', 'Tunde', 24, 'Student', 'Moderate income', 'high', 'Direct, practical, price-aware'],
		[
			'2',
			'Bola',
			28,
			'Product designer',
			'Middle income',
			'moderate',
			'Friendly and comparison-driven'
		],
		['3', 'Ada', 21, 'Undergraduate', 'Low income', 'very-high', 'Short, skeptical, deal-focused'],
		[
			'4',
			'Emeka',
			30,
			'Operations manager',
			'Middle income',
			'moderate',
			'Asks logistics questions first'
		],
		[
			'5',
			'Zainab',
			26,
			'Software tester',
			'Middle income',
			'high',
			'Trust-conscious and detail-oriented'
		],
		[
			'6',
			'Musa',
			27,
			'Sales associate',
			'Moderate income',
			'low',
			'Preference-led, quick to decide'
		]
	].map(
		([id, name, age, occupation, incomeLevel, priceSensitivity, communicationStyle], index) => ({
			age: Number(age),
			avatarAlt: `${name} customer avatar`,
			avatarSrc: [
				'/assets/2d/avatars/man.svg',
				'/assets/2d/avatars/woman.svg',
				'/assets/2d/avatars/girl.svg',
				'/assets/2d/avatars/boy.svg',
				'/assets/2d/avatars/woman-technologist.svg',
				'/assets/2d/avatars/person.svg'
			][index],
			buyingBehaviour: 'Compares delivery cost, portion size, and checkout trust before buying.',
			communicationStyle: String(communicationStyle),
			id: String(id),
			incomeLevel: String(incomeLevel),
			isActive: true,
			location: 'Lagos, Nigeria',
			name: String(name),
			occupation: String(occupation),
			priceSensitivity:
				priceSensitivity as CustomerAgentListViewModel['customers'][number]['priceSensitivity'],
			priceSensitivityLabel: String(priceSensitivity)
				.split('-')
				.map((part) => part[0].toUpperCase() + part.slice(1))
				.join(' '),
			relatedSimulation: {
				id: '1',
				status: 'completed',
				title: 'Shawarma Spot Menu'
			}
		})
	);

	const filtered = allCustomers
		.filter(
			(customer) =>
				!filters.priceSensitivity ||
				filters.priceSensitivity === 'all' ||
				customer.priceSensitivity === filters.priceSensitivity
		)
		.filter(() => !filters.simulationId || filters.simulationId === 'all')
		.filter((customer) => {
			if (!filters.search) return true;
			const query = filters.search.toLowerCase();
			return [customer.name, customer.location, customer.occupation, customer.incomeLevel].some(
				(value) => value.toLowerCase().includes(query)
			);
		});

	return {
		customers: filtered,
		filters,
		priceSensitivityOptions,
		simulationOptions: [
			{ label: 'All simulations', value: 'all' },
			{ label: 'Shawarma Spot Menu', value: '1' }
		],
		total: filtered.length
	};
}

export function getMockInsightsData(): InsightDashboardViewModel {
	return {
		cards: [
			{
				description: 'Customers show strongest demand around this tested price band.',
				id: 'pricing',
				title: 'Pricing Insight',
				tone: 'success',
				value: '\u20a63,200 - \u20a63,800'
			},
			{
				description: 'Positive sentiment is currently higher than negative sentiment at 23%.',
				id: 'sentiment',
				title: 'Sentiment Insight',
				tone: 'success',
				value: '49% positive'
			},
			{
				description: 'Delivery cost is the most repeated objection in the mock report set.',
				id: 'objection',
				title: 'Customer Objection',
				tone: 'warning',
				value: 'Delivery fee too high'
			},
			{
				description: 'Checkout trust appears as a conversion risk before scaling paid traffic.',
				id: 'risk',
				title: 'Conversion Risk',
				tone: 'danger',
				value: 'Checkout page not trusted'
			}
		],
		recommendations: ['Add WhatsApp ordering', 'Offer smaller portions', 'Build trust signals'],
		riskFactors: ['Delivery fee is too high', 'Checkout is not trusted', 'Price is slightly high'],
		sourceReportCount: 1,
		summary: 'Insights are derived from 1 mock report for frontend preview.'
	};
}

export function createMockBusinessMessage(content: string): ChatMessageViewModel {
	const sentAt = new Date().toISOString();
	return {
		body: content.trim(),
		id: `mock-message-${Date.now()}`,
		sender: 'business',
		sentAt,
		timestamp: new Intl.DateTimeFormat('en-NG', {
			hour: 'numeric',
			minute: '2-digit'
		}).format(new Date(sentAt))
	};
}
