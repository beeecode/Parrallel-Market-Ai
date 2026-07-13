import type { RequestSummaryProvider } from './types';

export function createFutureAiSummaryProvider(): RequestSummaryProvider {
	return {
		isConfigured: () => false,
		summarize: async () => {
			throw new Error('AI request summarization is not configured for this phase.');
		}
	};
}
