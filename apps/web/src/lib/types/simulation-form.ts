import type { CurrencyCode } from '@parallel-market-ai/shared-types';

export type SimulationProductOption = {
	id: string;
	name: string;
	category: string;
	currency: CurrencyCode;
	currentPrice: string;
	targetLocation: string;
	targetMarket: string;
};

export type SimulationCreateInput = {
	additionalInstructions: string;
	competitorContext: string;
	customerCount: string;
	customerSegments: string;
	marketConditions: string;
	pricingStrategy: string;
	product: string;
	simulationGoal: string;
	targetAudience: string;
	targetLocation: string;
	title: string;
};

export type SimulationCreateErrors = Partial<Record<keyof SimulationCreateInput | 'form', string>>;

export type SimulationCreateViewModel = {
	productOptions: SimulationProductOption[];
	values: SimulationCreateInput;
};

export type SimulationCreateResult = {
	errors?: SimulationCreateErrors;
	values: SimulationCreateInput;
};
