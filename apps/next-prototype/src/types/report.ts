export type ReportTabId =
  | "overview"
  | "customer-insights"
  | "pricing-analysis"
  | "recommendations"
  | "risk-factors";

export type SentimentPoint = {
  label: "Positive" | "Neutral" | "Negative";
  value: number;
  color: string;
};

export type ReportData = {
  title: string;
  successProbability: number;
  successLabel: string;
  sentiment: SentimentPoint[];
  positiveFeedback: string[];
  objections: string[];
  recommendations: string[];
  risks: string[];
  optimalPriceRange: string;
  currentAveragePrice: string;
};
