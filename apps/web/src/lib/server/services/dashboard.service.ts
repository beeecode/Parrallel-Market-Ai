import type { DashboardViewModel } from '$lib/types/dashboard';
import { mapDashboard } from '$lib/server/mappers/dashboard.mapper';
import { getMockDashboardData } from '$lib/server/mock/data';
import { isFrontendMockMode } from '$lib/server/mock/mode';
import { payloadRequest } from '$lib/server/payload/client';
import {
	isPayloadSimulation,
	payloadListValidator,
	type PayloadSimulation
} from '$lib/server/payload/types';

export async function getDashboardData(
	fetch: typeof globalThis.fetch,
	token: string
): Promise<DashboardViewModel | null> {
	if (isFrontendMockMode()) return getMockDashboardData();

	const response = await payloadRequest({
		fetch,
		path: '/api/simulations',
		query: {
			depth: 1,
			limit: 50,
			sort: '-completedAt,-startedAt,-updatedAt'
		},
		token,
		validate: payloadListValidator<PayloadSimulation>(isPayloadSimulation)
	});

	return mapDashboard(response.docs);
}
