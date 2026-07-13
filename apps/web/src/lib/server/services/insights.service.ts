import type { InsightDashboardViewModel } from '$lib/types/insight';
import { mapInsights } from '$lib/server/mappers/insight.mapper';
import { getMockInsightsData } from '$lib/server/mock/data';
import { isFrontendMockMode } from '$lib/server/mock/mode';
import { payloadRequest } from '$lib/server/payload/client';
import {
	isPayloadReport,
	payloadListValidator,
	type PayloadReport
} from '$lib/server/payload/types';

export async function getInsightsData(
	fetch: typeof globalThis.fetch,
	token: string
): Promise<InsightDashboardViewModel | null> {
	if (isFrontendMockMode()) return getMockInsightsData();

	const response = await payloadRequest({
		fetch,
		path: '/api/reports',
		query: {
			depth: 0,
			limit: 50,
			sort: '-generatedAt,-version',
			where: { status: { equals: 'completed' } }
		},
		token,
		validate: payloadListValidator<PayloadReport>(isPayloadReport)
	});

	return mapInsights(response.docs);
}
