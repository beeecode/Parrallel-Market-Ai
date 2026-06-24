export type SimulationTabId =
	| 'live-chat'
	| 'customer-agents'
	| 'activity-feed'
	| 'simulation-stats';

export type CustomerAgent = {
	id: string;
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
	sender: 'customer' | 'business';
	body: string;
	timestamp: string;
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
	title: string;
	status: 'Running' | 'Paused' | 'Completed';
	elapsedTime: string;
	agents: CustomerAgent[];
	messages: ChatMessage[];
	activity: ActivityEvent[];
	stats: SimulationStat[];
};
