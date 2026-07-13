export type ReportTabId =
	| 'overview'
	| 'customer-insights'
	| 'pricing-analysis'
	| 'recommendations'
	| 'risk-factors';

export type SentimentPoint = {
	label: 'Positive' | 'Neutral' | 'Negative';
	value: number;
	color: string;
};

export type FeedbackItem = {
	label: string;
};

export type ObjectionItem = {
	label: string;
};

export type RiskItem = {
	label: string;
};

export type RecommendationItem = {
	label: string;
};

export type PricingIntelligence = {
	optimalPriceRange: string;
	currentAveragePrice: string;
	revenueForecast: string;
};

export type ReportViewModel = {
	id: string;
	simulationId: string;
	title: string;
	successProbability: number;
	successLabel: string;
	sentiment: SentimentPoint[];
	positiveFeedback: FeedbackItem[];
	objections: ObjectionItem[];
	recommendations: RecommendationItem[];
	risks: RiskItem[];
	optimalPriceRange: string;
	currentAveragePrice: string;
	revenueForecast: string;
	status: 'Draft' | 'Generating' | 'Completed' | 'Failed';
};

export type SentimentBreakdown = SentimentPoint;
export type ReportData = ReportViewModel;
