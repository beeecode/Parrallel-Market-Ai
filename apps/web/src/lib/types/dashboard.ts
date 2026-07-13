export type DashboardMetric = {
	label: string;
	value: string;
	tone: 'primary' | 'success' | 'neutral';
	iconSrc: string;
	iconAlt: string;
};

export type SimulationActivityItem = {
	id: number;
	simulation: string;
	targetMarket: string;
	status: 'Completed' | 'Running' | 'Paused' | 'Failed' | 'Queued' | 'Draft';
	successScore: string;
	revenueForecast: string;
	date: string;
};

export type SuccessProbabilityMetric = {
	value: number;
	description: string;
};

export type RevenueForecastMetric = {
	value: string;
	subtitle: string;
	trend: number[];
};

export type DashboardViewModel = {
	successProbability: number;
	successCopy: string;
	revenueForecast: string;
	revenueSubtitle: string;
	revenueTrend: number[];
	metrics: DashboardMetric[];
	activity: SimulationActivityItem[];
};

export type Metric = DashboardMetric;
export type SimulationActivity = SimulationActivityItem;
export type DashboardData = DashboardViewModel;
