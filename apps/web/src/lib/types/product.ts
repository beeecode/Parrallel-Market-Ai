import type {
	CurrencyCode,
	ProductStatus,
	SimulationStatus
} from '@parallel-market-ai/shared-types';

export type ProductListFilters = {
	category?: string;
	search?: string;
	status?: ProductStatus | 'all';
};

export type ProductListItem = {
	id: string;
	name: string;
	category: string;
	currentPrice: string;
	currency: CurrencyCode;
	targetMarket: string;
	targetLocation: string;
	status: ProductStatus;
	statusLabel: string;
	statusTone: 'success' | 'purple' | 'warning' | 'neutral';
	simulationCount: number;
	updatedAt: string;
	href: string;
};

export type ProductListViewModel = {
	categories: string[];
	filters: ProductListFilters;
	products: ProductListItem[];
	statusOptions: { label: string; value: ProductStatus | 'all' }[];
	total: number;
};

export type ProductRelatedSimulation = {
	id: string;
	title: string;
	status: SimulationStatus;
	statusLabel: string;
	successProbability: string;
	updatedAt: string;
	href: string;
};

export type ProductDetailViewModel = {
	id: string;
	name: string;
	category: string;
	description: string;
	currentPrice: string;
	currency: CurrencyCode;
	targetMarket: string;
	targetLocation: string;
	status: ProductStatus;
	statusLabel: string;
	createdAt: string;
	updatedAt: string;
	relatedSimulations: ProductRelatedSimulation[];
	createSimulationHref: string;
};

export type ProductFormInput = {
	category: string;
	currency: CurrencyCode;
	currentPrice: string;
	description: string;
	name: string;
	status: ProductStatus;
	targetLocation: string;
	targetMarket: string;
};

export type ProductFormErrors = Partial<Record<keyof ProductFormInput | 'form', string>>;

export type ProductFormResult = {
	errors?: ProductFormErrors;
	values: ProductFormInput;
};
