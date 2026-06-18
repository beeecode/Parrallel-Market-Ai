import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { MetricCard } from "@/components/dashboard/MetricCard";
import type { LoadState, Metric } from "@/types/dashboard";

type MetricGridProps = {
  metrics: Metric[];
  state?: LoadState;
};

export function MetricGrid({ metrics, state = "ready" }: MetricGridProps) {
  if (state === "loading") {
    return <LoadingState label="Loading performance metrics..." />;
  }

  if (state === "error") {
    return <ErrorState description="Metrics could not be prepared from the local dataset." />;
  }

  if (state === "empty" || metrics.length === 0) {
    return (
      <EmptyState
        description="Run a simulation to see customer volume, conversations, purchase rate, and repeat rate."
        title="No metrics yet"
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} metric={metric} />
      ))}
    </div>
  );
}
