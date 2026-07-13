import type { RequestAgentValues } from '$lib/types/request-agent';
import { requestAgentSteps } from './request-agent.steps';

export function firstIncompleteRequestStep(values: RequestAgentValues): number {
	const index = requestAgentSteps.findIndex((step) => !values[step.field]?.trim());
	return index === -1 ? requestAgentSteps.length - 1 : index;
}

export function nextRequestStepIndex(current: number): number {
	return Math.min(current + 1, requestAgentSteps.length - 1);
}

export function previousRequestStepIndex(current: number): number {
	return Math.max(current - 1, 0);
}
