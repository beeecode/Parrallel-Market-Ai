import type { CurrencyCode, RequestStatus } from '@parallel-market-ai/shared-types';

export type RequestAgentField =
	| 'customerName'
	| 'email'
	| 'company'
	| 'businessType'
	| 'productName'
	| 'productDescription'
	| 'targetMarket'
	| 'targetLocation'
	| 'targetCustomers'
	| 'currentPrice'
	| 'currency'
	| 'businessChallenge'
	| 'simulationGoal'
	| 'budget'
	| 'timeline';

export type RequestAgentValues = Record<RequestAgentField, string>;

export type RequestAgentErrors = Partial<Record<RequestAgentField | 'form', string>>;

export type RequestAgentStep = {
	field: RequestAgentField;
	group: 'contact' | 'business' | 'product' | 'market' | 'pricing' | 'strategy';
	helper?: string;
	inputKind: 'email' | 'number' | 'select' | 'text' | 'textarea';
	maxLength?: number;
	options?: Array<{ label: string; value: string }>;
	placeholder: string;
	question: string;
	title: string;
};

export type ValidCustomSimulationRequestInput = {
	budget: number;
	businessChallenge: string;
	businessType: string;
	company: string;
	currency: CurrencyCode;
	currentPrice: number;
	customerName: string;
	email: string;
	productDescription: string;
	productName: string;
	simulationGoal: string;
	targetCustomers: string;
	targetLocation: string;
	targetMarket: string;
	timeline: string;
};

export type RequestReviewItem = {
	field: RequestAgentField;
	label: string;
	value: string;
};

export type RequestReviewSection = {
	items: RequestReviewItem[];
	title: string;
};

export type SubmittedCustomRequestViewModel = {
	id: string;
	productName: string;
	reference: string;
	status: RequestStatus;
};

export type RequestAgentActionResult =
	| {
			request: SubmittedCustomRequestViewModel;
			success: true;
			values: RequestAgentValues;
	  }
	| {
			errorMessage?: string;
			errors: RequestAgentErrors;
			success: false;
			values: RequestAgentValues;
	  };

export type PayloadCustomSimulationRequest = {
	budget?: number | null;
	businessChallenge: string;
	businessType: string;
	company: string;
	conversationSummary?: string | null;
	currency: CurrencyCode;
	currentPrice?: number | null;
	customerName: string;
	email: string;
	id: number;
	productDescription: string;
	productName: string;
	simulationGoal: string;
	status: RequestStatus;
	submittedAt?: string | null;
	targetCustomers: string;
	targetLocation: string;
	targetMarket: string;
	timeline: string;
};
