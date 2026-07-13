import { PayloadValidationError } from '$lib/server/payload/errors';
import { payloadRequest } from '$lib/server/payload/client';
import {
	isPayloadCustomSimulationRequest,
	payloadDocumentValidator
} from '$lib/server/payload/types';
import { mapCustomSimulationRequest } from '$lib/server/mappers/custom-request.mapper';
import { createRequestSummary } from '$lib/server/ai/request-summary.service';
import {
	requestAgentValuesFromFormData,
	validateRequestAgentValues
} from '$lib/features/request-agent/request-agent.utils';
import type {
	PayloadCustomSimulationRequest,
	RequestAgentValues,
	SubmittedCustomRequestViewModel
} from '$lib/types/request-agent';

export function customRequestInputFromFormData(formData: FormData): RequestAgentValues {
	return requestAgentValuesFromFormData(formData);
}

export async function createCustomSimulationRequest(
	fetch: typeof globalThis.fetch,
	token: string,
	values: RequestAgentValues
): Promise<SubmittedCustomRequestViewModel> {
	const validation = validateRequestAgentValues(values);
	if ('errors' in validation) {
		throw new PayloadValidationError('Check the request details and try again.', validation.errors);
	}

	const summary = await createRequestSummary(validation.data);
	const response = await payloadRequest({
		body: {
			...validation.data,
			conversationSummary: summary.summary
		},
		fetch,
		method: 'POST',
		path: '/api/custom-simulation-requests',
		token,
		validate: payloadDocumentValidator<PayloadCustomSimulationRequest>(
			isPayloadCustomSimulationRequest
		)
	});

	return mapCustomSimulationRequest(response.doc);
}
