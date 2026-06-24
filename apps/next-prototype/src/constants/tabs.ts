import type { ReportTabId } from "@/types/report";
import type { SimulationTabId } from "@/types/simulation";

export const simulationTabs: Array<{ id: SimulationTabId; label: string }> = [
  { id: "live-chat", label: "Live Chat" },
  { id: "customer-agents", label: "Customer Agents" },
  { id: "activity-feed", label: "Activity Feed" },
  { id: "simulation-stats", label: "Simulation Stats" },
];

export const reportTabs: Array<{ id: ReportTabId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "customer-insights", label: "Customer Insights" },
  { id: "pricing-analysis", label: "Pricing Analysis" },
  { id: "recommendations", label: "Recommendations" },
  { id: "risk-factors", label: "Risk Factors" },
];
