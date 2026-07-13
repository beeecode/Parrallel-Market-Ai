import type { SimulationWorkspaceViewModel } from '$lib/types/simulation';
import { mapSimulationWorkspace } from '$lib/server/mappers/simulation.mapper';
import { getMockSimulationWorkspace } from '$lib/server/mock/data';
import { isFrontendMockMode } from '$lib/server/mock/mode';
import { PayloadNotFoundError } from '$lib/server/payload/errors';
import { payloadRequest } from '$lib/server/payload/client';
import {
	isPayloadConversation,
	isPayloadCustomerAgent,
	isPayloadMessage,
	isPayloadReport,
	isPayloadSimulation,
	payloadListValidator,
	type PayloadConversation,
	type PayloadCustomerAgent,
	type PayloadMessage,
	type PayloadReport,
	type PayloadSimulation
} from '$lib/server/payload/types';

async function findSimulation(
	fetch: typeof globalThis.fetch,
	token: string,
	simulationId?: number
): Promise<PayloadSimulation | null> {
	const requested = simulationId
		? await payloadRequest({
				fetch,
				path: '/api/simulations',
				query: {
					depth: 1,
					limit: 1,
					where: { id: { equals: simulationId } }
				},
				token,
				validate: payloadListValidator<PayloadSimulation>(isPayloadSimulation)
			})
		: await payloadRequest({
				fetch,
				path: '/api/simulations',
				query: {
					depth: 1,
					limit: 1,
					sort: '-startedAt,-updatedAt',
					where: { status: { equals: 'running' } }
				},
				token,
				validate: payloadListValidator<PayloadSimulation>(isPayloadSimulation)
			});

	if (requested.docs[0]) return requested.docs[0];
	if (simulationId) throw new PayloadNotFoundError('This simulation could not be found.');

	const fallback = await payloadRequest({
		fetch,
		path: '/api/simulations',
		query: {
			depth: 1,
			limit: 1,
			sort: '-completedAt,-updatedAt',
			where: { status: { not_equals: 'draft' } }
		},
		token,
		validate: payloadListValidator<PayloadSimulation>(isPayloadSimulation)
	});

	if (fallback.docs[0]) return fallback.docs[0];

	const draftFallback = await payloadRequest({
		fetch,
		path: '/api/simulations',
		query: {
			depth: 1,
			limit: 1,
			sort: '-updatedAt'
		},
		token,
		validate: payloadListValidator<PayloadSimulation>(isPayloadSimulation)
	});

	return draftFallback.docs[0] ?? null;
}

export async function getSimulationWorkspace(
	fetch: typeof globalThis.fetch,
	token: string,
	simulationId?: number
): Promise<SimulationWorkspaceViewModel | null> {
	if (isFrontendMockMode()) return getMockSimulationWorkspace(simulationId);

	const simulation = await findSimulation(fetch, token, simulationId);
	if (!simulation) return null;

	const where = { simulation: { equals: simulation.id } };
	const [agents, conversations, messages, reports] = await Promise.all([
		payloadRequest({
			fetch,
			path: '/api/customer-agents',
			query: { depth: 1, limit: 100, sort: 'createdAt', where },
			token,
			validate: payloadListValidator<PayloadCustomerAgent>(isPayloadCustomerAgent)
		}),
		payloadRequest({
			fetch,
			path: '/api/conversations',
			query: { depth: 0, limit: 100, sort: 'startedAt', where },
			token,
			validate: payloadListValidator<PayloadConversation>(isPayloadConversation)
		}),
		payloadRequest({
			fetch,
			path: '/api/messages',
			query: { depth: 0, limit: 200, sort: 'sentAt', where },
			token,
			validate: payloadListValidator<PayloadMessage>(isPayloadMessage)
		}),
		payloadRequest({
			fetch,
			path: '/api/reports',
			query: { depth: 0, limit: 1, sort: '-generatedAt,-version', where },
			token,
			validate: payloadListValidator<PayloadReport>(isPayloadReport)
		})
	]);

	return mapSimulationWorkspace(
		simulation,
		agents.docs,
		conversations.docs,
		messages.docs,
		reports.docs
	);
}
