import { createFutureAiSummaryProvider } from './ai-provider';
import { generateDeterministicRequestSummary } from './deterministic-summary';
import type { RequestSummaryInput, RequestSummaryProvider, RequestSummaryResult } from './types';

export async function createRequestSummary(
	input: RequestSummaryInput,
	provider: RequestSummaryProvider = createFutureAiSummaryProvider()
): Promise<RequestSummaryResult> {
	if (provider.isConfigured()) {
		try {
			return await provider.summarize(input);
		} catch {
			return generateDeterministicRequestSummary(input);
		}
	}

	return generateDeterministicRequestSummary(input);
}
