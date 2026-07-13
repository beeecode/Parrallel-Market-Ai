export type SimulationTabId =
	| 'live-chat'
	| 'customer-agents'
	| 'activity-feed'
	| 'simulation-stats';

export type CustomerAgent = {
	id: string;
	conversationId?: string;
	name: string;
	age: number;
	avatarSrc: string;
	avatarAlt: string;
	preview: string;
	lastSeen: string;
	accent: string;
};

export type ChatMessage = {
	id: string;
	sender: 'customer' | 'business' | 'system';
	body: string;
	timestamp: string;
	sentAt: string;
};

export type ActivityEvent = {
	id: string;
	title: string;
	description: string;
	timestamp: string;
	tone: 'success' | 'warning' | 'neutral';
};

export type SimulationStat = {
	label: string;
	value: string;
	detail: string;
};

export type LiveSimulationData = {
	simulationId: string;
	title: string;
	status: 'Running' | 'Paused' | 'Completed' | 'Draft' | 'Queued' | 'Failed';
	elapsedTime: string;
	activeAgentId: string;
	agents: CustomerAgent[];
	messagesByAgent: Record<string, ChatMessage[]>;
	activity: ActivityEvent[];
	stats: SimulationStat[];
};

export type CustomerAgentViewModel = CustomerAgent;

export type ConversationViewModel = {
	id: string;
	agentId: string;
	messages: ChatMessage[];
};

export type ChatMessageViewModel = ChatMessage;
export type SimulationStatsViewModel = SimulationStat;
export type ActivityFeedItem = ActivityEvent;
export type SimulationWorkspaceViewModel = LiveSimulationData;
