import type { PriceSensitivity, SimulationStatus } from '@parallel-market-ai/shared-types';

export type CustomerListFilters = {
	priceSensitivity?: PriceSensitivity | 'all';
	search?: string;
	simulationId?: string;
};

export type CustomerAgentListItem = {
	id: string;
	name: string;
	age: number;
	location: string;
	occupation: string;
	incomeLevel: string;
	priceSensitivity: PriceSensitivity;
	priceSensitivityLabel: string;
	communicationStyle: string;
	buyingBehaviour: string;
	relatedSimulation: {
		id: string;
		title: string;
		status: SimulationStatus;
	};
	isActive: boolean;
	avatarSrc: string;
	avatarAlt: string;
};

export type CustomerAgentListViewModel = {
	customers: CustomerAgentListItem[];
	filters: CustomerListFilters;
	priceSensitivityOptions: { label: string; value: PriceSensitivity | 'all' }[];
	simulationOptions: { label: string; value: string }[];
	total: number;
};
