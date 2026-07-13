export type InsightCardViewModel = {
	id: string;
	title: string;
	value: string;
	description: string;
	tone: 'success' | 'purple' | 'warning' | 'danger' | 'neutral';
};

export type InsightDashboardViewModel = {
	cards: InsightCardViewModel[];
	recommendations: string[];
	riskFactors: string[];
	sourceReportCount: number;
	summary: string;
};
