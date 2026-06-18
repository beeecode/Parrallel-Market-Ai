export type LoadState = "ready" | "loading" | "empty" | "error";

export type Metric = {
  label: string;
  value: string;
  tone?: "primary" | "success" | "neutral";
  iconSrc?: string;
  iconAlt?: string;
};

export type SimulationActivity = {
  simulation: string;
  targetMarket: string;
  status: "Completed" | "Running" | "Draft";
  successScore: string;
  revenueForecast: string;
  date: string;
};

export type DashboardData = {
  successProbability: number;
  successCopy: string;
  revenueForecast: string;
  revenueSubtitle: string;
  revenueTrend: number[];
  metrics: Metric[];
  activity: SimulationActivity[];
};
