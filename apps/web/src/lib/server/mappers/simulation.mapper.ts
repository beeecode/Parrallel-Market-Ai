import type {
	ActivityEvent,
	ChatMessage,
	CustomerAgent,
	LiveSimulationData
} from '$lib/types/simulation';
import type {
	PayloadConversation,
	PayloadCustomerAgent,
	PayloadMessage,
	PayloadMedia,
	PayloadReport,
	PayloadSimulation
} from '$lib/server/payload/types';
import {
	formatElapsed,
	formatTime,
	relationshipId,
	titleCase
} from '$lib/server/mappers/mapper-utils';

const agentFallbacks: Record<string, string> = {
	ada: '/assets/2d/avatars/girl.svg',
	bola: '/assets/2d/avatars/woman.svg',
	emeka: '/assets/2d/avatars/boy.svg',
	musa: '/assets/2d/avatars/person.svg',
	tunde: '/assets/2d/avatars/man.svg',
	zainab: '/assets/2d/avatars/woman-technologist.svg'
};

const agentAccents = ['#8b5cf6', '#f59e0b', '#fb923c', '#facc15', '#60a5fa', '#f97316'];

function avatarUrl(agent: PayloadCustomerAgent): string {
	if (typeof agent.avatar === 'object' && agent.avatar) {
		const media = agent.avatar as PayloadMedia;
		if (media.url) return media.url;
	}

	return agentFallbacks[agent.name.toLowerCase()] || '/assets/2d/avatars/person.svg';
}

function mapMessage(message: PayloadMessage): ChatMessage {
	return {
		id: String(message.id),
		sender: message.senderType,
		body: message.content,
		timestamp: formatTime(message.sentAt),
		sentAt: message.sentAt
	};
}

function statusLabel(status: PayloadSimulation['status']): LiveSimulationData['status'] {
	const label = titleCase(status);
	if (
		label === 'Running' ||
		label === 'Paused' ||
		label === 'Completed' ||
		label === 'Queued' ||
		label === 'Failed'
	) {
		return label;
	}
	return 'Draft';
}

function activityFromRecords(
	simulation: PayloadSimulation,
	conversations: PayloadConversation[],
	messages: PayloadMessage[],
	report: PayloadReport | undefined
): ActivityEvent[] {
	const activity: ActivityEvent[] = [
		{
			id: `simulation-${simulation.id}`,
			title: `Simulation ${simulation.status}`,
			description: `${simulation.title} is currently ${simulation.status}.`,
			timestamp: formatTime(simulation.completedAt ?? simulation.startedAt ?? simulation.updatedAt),
			tone: simulation.status === 'failed' ? 'warning' : 'success'
		}
	];

	if (conversations.length > 0) {
		activity.push({
			id: `conversations-${simulation.id}`,
			title: `${conversations.length} customer conversations available`,
			description: 'Conversation records are linked to customer agents in this simulation.',
			timestamp: formatTime(
				conversations
					.map((conversation) => conversation.lastMessageAt ?? conversation.startedAt)
					.filter((value): value is string => Boolean(value))
					.sort()
					.at(-1)
			),
			tone: 'neutral'
		});
	}

	const latestMessage = [...messages].sort(
		(left, right) => new Date(right.sentAt).getTime() - new Date(left.sentAt).getTime()
	)[0];
	if (latestMessage) {
		activity.push({
			id: `message-${latestMessage.id}`,
			title: 'Latest conversation activity',
			description: latestMessage.content,
			timestamp: formatTime(latestMessage.sentAt),
			tone: latestMessage.senderType === 'business' ? 'success' : 'neutral'
		});
	}

	if (report) {
		activity.push({
			id: `report-${report.id}`,
			title: `Report ${report.status}`,
			description: `Report version ${report.version} is available for this simulation.`,
			timestamp: formatTime(report.generatedAt),
			tone: report.status === 'failed' ? 'warning' : 'success'
		});
	}

	return activity.slice(0, 4);
}

export function mapSimulationWorkspace(
	simulation: PayloadSimulation,
	agents: PayloadCustomerAgent[],
	conversations: PayloadConversation[],
	messages: PayloadMessage[],
	reports: PayloadReport[]
): LiveSimulationData {
	const conversationsByAgent = new Map<number, PayloadConversation>();
	for (const conversation of conversations) {
		const agentId = relationshipId(conversation.customerAgent);
		if (agentId !== null) conversationsByAgent.set(agentId, conversation);
	}

	const messagesByConversation = new Map<number, ChatMessage[]>();
	for (const message of [...messages].sort(
		(left, right) => new Date(left.sentAt).getTime() - new Date(right.sentAt).getTime()
	)) {
		const conversationId = relationshipId(message.conversation);
		if (conversationId === null) continue;
		const current = messagesByConversation.get(conversationId) ?? [];
		current.push(mapMessage(message));
		messagesByConversation.set(conversationId, current);
	}

	const mappedAgents: CustomerAgent[] = agents.map((agent, index) => {
		const conversation = conversationsByAgent.get(agent.id);
		const conversationMessages = conversation
			? (messagesByConversation.get(conversation.id) ?? [])
			: [];
		const latest = conversationMessages.at(-1);

		return {
			id: String(agent.id),
			conversationId: conversation ? String(conversation.id) : undefined,
			name: agent.name,
			age: agent.age,
			avatarSrc: avatarUrl(agent),
			avatarAlt: `${agent.name} customer avatar`,
			preview: latest?.body || conversation?.summary || 'No conversation yet',
			lastSeen: latest?.timestamp || formatTime(conversation?.lastMessageAt),
			accent: agentAccents[index % agentAccents.length]
		};
	});

	const messagesByAgent: Record<string, ChatMessage[]> = {};
	for (const agent of mappedAgents) {
		messagesByAgent[agent.id] = agent.conversationId
			? (messagesByConversation.get(Number(agent.conversationId)) ?? [])
			: [];
	}

	return {
		simulationId: String(simulation.id),
		title: `Live Simulation - ${simulation.title}`,
		status: statusLabel(simulation.status),
		elapsedTime: formatElapsed(
			simulation.startedAt,
			simulation.completedAt ?? (simulation.status === 'running' ? undefined : simulation.updatedAt)
		),
		activeAgentId: mappedAgents[0]?.id ?? '',
		agents: mappedAgents,
		messagesByAgent,
		activity: activityFromRecords(simulation, conversations, messages, reports[0]),
		stats: [
			{
				label: 'Customers Simulated',
				value: simulation.customerCount.toLocaleString('en-NG'),
				detail: 'Configured customer population'
			},
			{
				label: 'Conversations Captured',
				value: simulation.conversationCount.toLocaleString('en-NG'),
				detail: `${conversations.length} representative conversation records loaded`
			},
			{
				label: 'Purchase Rate',
				value: `${simulation.purchaseRate ?? 0}%`,
				detail: 'Purchase intent recorded for the simulation'
			},
			{
				label: 'Repeat Rate',
				value: `${simulation.repeatRate ?? 0}%`,
				detail: 'Expected repeat customer rate'
			}
		]
	};
}
