import type { RequestSummaryInput, RequestSummaryResult } from './types';

export function generateDeterministicRequestSummary(
	input: RequestSummaryInput
): RequestSummaryResult {
	return {
		mode: 'deterministic',
		summary: [
			`Business: ${input.company}`,
			`Product: ${input.productName}`,
			`Target Market: ${input.targetMarket}`,
			`Challenge: ${input.businessChallenge}`,
			`Goal: ${input.simulationGoal}`
		].join('\n')
	};
}
