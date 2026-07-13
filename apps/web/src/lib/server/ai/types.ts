import type { ValidCustomSimulationRequestInput } from '$lib/types/request-agent';

export type RequestSummaryMode = 'deterministic' | 'ai';

export type RequestSummaryResult = {
	mode: RequestSummaryMode;
	summary: string;
};

export type RequestSummaryInput = ValidCustomSimulationRequestInput;

export type RequestSummaryProvider = {
	isConfigured: () => boolean;
	summarize: (input: RequestSummaryInput) => Promise<RequestSummaryResult>;
};
