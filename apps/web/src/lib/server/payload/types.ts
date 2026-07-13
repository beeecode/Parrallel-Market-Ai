import type {
	ConversationStatus,
	CurrencyCode,
	MessageSenderType,
	PriceSensitivity,
	ProductStatus,
	ReportStatus,
	SimulationStatus,
	UserRole
} from '@parallel-market-ai/shared-types';

import type { PayloadListResponse } from '$lib/types/api';
import type { PayloadCustomSimulationRequest } from '$lib/types/request-agent';

export type PayloadMedia = {
	id: number;
	alt?: string | null;
	url?: string | null;
};

export type PayloadUser = {
	id: number;
	name: string;
	email: string;
	role: UserRole;
	company?: string | null;
	avatar?: number | PayloadMedia | null;
	isActive?: boolean | null;
};

export type PayloadProduct = {
	id: number;
	owner: number | { id: number };
	name: string;
	slug: string;
	category: string;
	description: string;
	image?: number | PayloadMedia | null;
	currentPrice: number;
	targetMarket: string;
	targetLocation: string;
	currency: CurrencyCode;
	status: ProductStatus;
	updatedAt: string;
	createdAt: string;
};

export type PayloadSimulationConfiguration = {
	simulationGoal?: string | null;
	marketConditions?: string | null;
	pricingStrategy?: string | null;
	customerSegments?: { segment: string; id?: string | null }[] | null;
	competitorContext?: string | null;
	additionalInstructions?: string | null;
};

export type PayloadSimulation = {
	id: number;
	owner: number | { id: number };
	product: number | PayloadProduct;
	title: string;
	targetAudience: string;
	targetLocation: string;
	customerCount: number;
	conversationCount: number;
	status: SimulationStatus;
	successProbability?: number | null;
	purchaseRate?: number | null;
	repeatRate?: number | null;
	revenueMinimum?: number | null;
	revenueMaximum?: number | null;
	currency: CurrencyCode;
	startedAt?: string | null;
	completedAt?: string | null;
	configuration?: PayloadSimulationConfiguration | null;
	updatedAt: string;
	createdAt: string;
};

export type PayloadCustomerAgent = {
	id: number;
	simulation: number | Pick<PayloadSimulation, 'id' | 'title' | 'status'>;
	name: string;
	age: number;
	location?: string | null;
	occupation?: string | null;
	incomeLevel?: string | null;
	personality?: string | null;
	interests?: { interest: string; id?: string | null }[] | null;
	buyingBehaviour?: string | null;
	priceSensitivity?: PriceSensitivity | null;
	communicationStyle?: string | null;
	avatar?: number | PayloadMedia | null;
	isActive?: boolean | null;
	createdAt: string;
	updatedAt?: string;
};

export type PayloadConversation = {
	id: number;
	simulation: number | { id: number };
	customerAgent: number | { id: number };
	status: ConversationStatus;
	startedAt?: string | null;
	endedAt?: string | null;
	summary?: string | null;
	messageCount?: number | null;
	lastMessageAt?: string | null;
};

export type PayloadMessage = {
	id: number;
	conversation: number | { id: number };
	simulation: number | { id: number };
	customerAgent?: number | { id: number } | null;
	senderType: MessageSenderType;
	content: string;
	sentAt: string;
	clientSubmissionId?: string | null;
	createdAt: string;
};

type FeedbackEntry = {
	label: string;
	description?: string | null;
	importance: string;
};

export type PayloadReport = {
	id: number;
	simulation: number | { id: number };
	status: ReportStatus;
	successProbability: number;
	positiveSentiment: number;
	neutralSentiment: number;
	negativeSentiment: number;
	positiveFeedback?: FeedbackEntry[] | null;
	customerObjections?: FeedbackEntry[] | null;
	optimalPriceMinimum: number;
	optimalPriceMaximum: number;
	currentAveragePrice: number;
	currency: CurrencyCode;
	revenueMinimum: number;
	revenueMaximum: number;
	riskFactors?: FeedbackEntry[] | null;
	recommendations?: FeedbackEntry[] | null;
	executiveSummary: string;
	generatedAt?: string | null;
	version: number;
};

export type PayloadLoginResponse = {
	exp: number;
	token: string;
	user: PayloadUser;
};

export type PayloadMeResponse = {
	exp?: number;
	token?: string;
	user: PayloadUser | null;
};

export type PayloadDocumentResponse<T> = {
	doc: T;
	message?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasNumber(value: Record<string, unknown>, key: string): boolean {
	return typeof value[key] === 'number';
}

function hasString(value: Record<string, unknown>, key: string): boolean {
	return typeof value[key] === 'string';
}

function hasRelationship(value: Record<string, unknown>, key: string): boolean {
	return typeof value[key] === 'number' || isRecord(value[key]);
}

export function isPayloadUser(value: unknown): value is PayloadUser {
	if (!isRecord(value)) return false;

	return (
		hasNumber(value, 'id') &&
		hasString(value, 'name') &&
		hasString(value, 'email') &&
		hasString(value, 'role') &&
		value.isActive !== false
	);
}

export function isPayloadLoginResponse(value: unknown): value is PayloadLoginResponse {
	if (!isRecord(value)) return false;

	return hasString(value, 'token') && hasNumber(value, 'exp') && isPayloadUser(value.user);
}

export function isPayloadMeResponse(value: unknown): value is PayloadMeResponse {
	return isRecord(value) && (value.user === null || isPayloadUser(value.user));
}

export function isPayloadSimulation(value: unknown): value is PayloadSimulation {
	if (!isRecord(value)) return false;

	return (
		hasNumber(value, 'id') &&
		hasRelationship(value, 'owner') &&
		hasRelationship(value, 'product') &&
		hasString(value, 'title') &&
		hasString(value, 'targetLocation') &&
		hasNumber(value, 'customerCount') &&
		hasNumber(value, 'conversationCount') &&
		hasString(value, 'status') &&
		hasString(value, 'currency') &&
		hasString(value, 'updatedAt')
	);
}

export function isPayloadProduct(value: unknown): value is PayloadProduct {
	if (!isRecord(value)) return false;

	return (
		hasNumber(value, 'id') &&
		hasRelationship(value, 'owner') &&
		hasString(value, 'name') &&
		hasString(value, 'slug') &&
		hasString(value, 'category') &&
		hasString(value, 'description') &&
		hasNumber(value, 'currentPrice') &&
		hasString(value, 'currency') &&
		hasString(value, 'targetMarket') &&
		hasString(value, 'targetLocation') &&
		hasString(value, 'status') &&
		hasString(value, 'updatedAt') &&
		hasString(value, 'createdAt')
	);
}

export function isPayloadCustomerAgent(value: unknown): value is PayloadCustomerAgent {
	if (!isRecord(value)) return false;

	return (
		hasNumber(value, 'id') &&
		hasRelationship(value, 'simulation') &&
		hasString(value, 'name') &&
		hasNumber(value, 'age') &&
		hasString(value, 'createdAt')
	);
}

export function isPayloadConversation(value: unknown): value is PayloadConversation {
	if (!isRecord(value)) return false;

	return (
		hasNumber(value, 'id') &&
		hasRelationship(value, 'simulation') &&
		hasRelationship(value, 'customerAgent') &&
		hasString(value, 'status')
	);
}

export function isPayloadMessage(value: unknown): value is PayloadMessage {
	if (!isRecord(value)) return false;

	return (
		hasNumber(value, 'id') &&
		hasRelationship(value, 'conversation') &&
		hasRelationship(value, 'simulation') &&
		hasString(value, 'senderType') &&
		hasString(value, 'content') &&
		hasString(value, 'sentAt')
	);
}

export function isPayloadReport(value: unknown): value is PayloadReport {
	if (!isRecord(value)) return false;

	return (
		hasNumber(value, 'id') &&
		hasRelationship(value, 'simulation') &&
		hasString(value, 'status') &&
		hasNumber(value, 'successProbability') &&
		hasNumber(value, 'positiveSentiment') &&
		hasNumber(value, 'neutralSentiment') &&
		hasNumber(value, 'negativeSentiment') &&
		hasNumber(value, 'optimalPriceMinimum') &&
		hasNumber(value, 'optimalPriceMaximum') &&
		hasNumber(value, 'currentAveragePrice') &&
		hasString(value, 'currency')
	);
}

export function isPayloadCustomSimulationRequest(
	value: unknown
): value is PayloadCustomSimulationRequest {
	if (!isRecord(value)) return false;

	return (
		hasNumber(value, 'id') &&
		hasString(value, 'customerName') &&
		hasString(value, 'email') &&
		hasString(value, 'company') &&
		hasString(value, 'businessType') &&
		hasString(value, 'productName') &&
		hasString(value, 'productDescription') &&
		hasString(value, 'targetMarket') &&
		hasString(value, 'targetLocation') &&
		hasString(value, 'targetCustomers') &&
		hasString(value, 'currency') &&
		hasString(value, 'businessChallenge') &&
		hasString(value, 'simulationGoal') &&
		hasString(value, 'timeline') &&
		hasString(value, 'status')
	);
}

export function payloadListValidator<T>(
	itemValidator: (value: unknown) => value is T
): (value: unknown) => PayloadListResponse<T> {
	return (value: unknown) => {
		if (
			!isRecord(value) ||
			!Array.isArray(value.docs) ||
			!value.docs.every(itemValidator) ||
			typeof value.totalDocs !== 'number' ||
			typeof value.limit !== 'number' ||
			typeof value.page !== 'number' ||
			typeof value.totalPages !== 'number'
		) {
			throw new Error('Invalid Payload list response.');
		}

		return value as PayloadListResponse<T>;
	};
}

export function payloadDocumentValidator<T>(
	itemValidator: (value: unknown) => value is T
): (value: unknown) => PayloadDocumentResponse<T> {
	return (value: unknown) => {
		if (!isRecord(value) || !itemValidator(value.doc)) {
			throw new Error('Invalid Payload document response.');
		}

		return value as PayloadDocumentResponse<T>;
	};
}
