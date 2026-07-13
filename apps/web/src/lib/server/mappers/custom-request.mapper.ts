import type {
	PayloadCustomSimulationRequest,
	SubmittedCustomRequestViewModel
} from '$lib/types/request-agent';

export function mapCustomSimulationRequest(
	request: PayloadCustomSimulationRequest
): SubmittedCustomRequestViewModel {
	return {
		id: String(request.id),
		productName: request.productName,
		reference: `CSR-${String(request.id).padStart(5, '0')}`,
		status: request.status
	};
}
