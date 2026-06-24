import { MetricGrid } from "@/components/dashboard/MetricGrid";
import { RevenueForecastCard } from "@/components/dashboard/RevenueForecastCard";
import { SimulationActivityTable } from "@/components/dashboard/SimulationActivityTable";
import { SuccessProbabilityCard } from "@/components/dashboard/SuccessProbabilityCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { getDashboardData } from "@/services/dummy-data/dashboard-data";

function PlusIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

export function DashboardScreen() {
  const data = getDashboardData();

  return (
    <div>
      <PageHeader
        actions={
          <Button>
            <PlusIcon />
            New Simulation
          </Button>
        }
        subtitle="Overview of your simulation performance"
        title="Dashboard"
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <SuccessProbabilityCard
          description={data.successCopy}
          value={data.successProbability}
        />
        <RevenueForecastCard
          forecast={data.revenueForecast}
          subtitle={data.revenueSubtitle}
          trend={data.revenueTrend}
        />
      </div>

      <div className="mt-5">
        <MetricGrid metrics={data.metrics} />
      </div>

      <div className="mt-5">
        <SimulationActivityTable rows={data.activity} />
      </div>
    </div>
  );
}
