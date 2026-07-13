import type { CustomerAgentListViewModel } from '$lib/types/customer';
import { mapCustomerAgents } from '$lib/server/mappers/customer.mapper';
import { getMockCustomersData } from '$lib/server/mock/data';
import { isFrontendMockMode } from '$lib/server/mock/mode';
import { payloadRequest } from '$lib/server/payload/client';
import type { PayloadQueryValue } from '$lib/server/payload/query';
import {
	isPayloadCustomerAgent,
	payloadListValidator,
	type PayloadCustomerAgent
} from '$lib/server/payload/types';

function safeFilter(value: string | null): string | undefined {
	const trimmed = value?.trim();
	return trimmed || undefined;
}

export function customerFiltersFromUrl(url: URL): CustomerAgentListViewModel['filters'] {
	return {
		priceSensitivity:
			(safeFilter(url.searchParams.get('priceSensitivity')) as
				| CustomerAgentListViewModel['filters']['priceSensitivity']
				| undefined) || 'all',
		search: safeFilter(url.searchParams.get('search')),
		simulationId: safeFilter(url.searchParams.get('simulationId')) || 'all'
	};
}

function customerWhere(
	filters: CustomerAgentListViewModel['filters']
): PayloadQueryValue | undefined {
	const clauses: PayloadQueryValue[] = [];

	if (filters.priceSensitivity && filters.priceSensitivity !== 'all') {
		clauses.push({ priceSensitivity: { equals: filters.priceSensitivity } });
	}

	if (filters.simulationId && filters.simulationId !== 'all') {
		clauses.push({ simulation: { equals: Number(filters.simulationId) } });
	}

	if (filters.search) {
		clauses.push({
			or: [
				{ name: { contains: filters.search } },
				{ location: { contains: filters.search } },
				{ occupation: { contains: filters.search } },
				{ incomeLevel: { contains: filters.search } }
			]
		});
	}

	if (clauses.length === 0) return undefined;
	return clauses.length === 1 ? clauses[0] : { and: clauses };
}

export async function getCustomersData(
	fetch: typeof globalThis.fetch,
	token: string,
	filters: CustomerAgentListViewModel['filters']
): Promise<CustomerAgentListViewModel> {
	if (isFrontendMockMode()) return getMockCustomersData(filters);

	const response = await payloadRequest({
		fetch,
		path: '/api/customer-agents',
		query: {
			depth: 1,
			limit: 150,
			sort: 'name',
			where: customerWhere(filters)
		},
		token,
		validate: payloadListValidator<PayloadCustomerAgent>(isPayloadCustomerAgent)
	});

	return mapCustomerAgents(response.docs, filters);
}
