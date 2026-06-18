import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import type { LoadState, SimulationActivity } from "@/types/dashboard";

type SimulationActivityTableProps = {
  rows: SimulationActivity[];
  state?: LoadState;
};

export function SimulationActivityTable({
  rows,
  state = "ready",
}: SimulationActivityTableProps) {
  if (state === "loading") {
    return <LoadingState label="Loading simulation activity..." />;
  }

  if (state === "error") {
    return <ErrorState description="Simulation activity could not be loaded." />;
  }

  if (state === "empty" || rows.length === 0) {
    return (
      <EmptyState
        description="Completed simulations will appear here with market, status, score, forecast, and date."
        title="No simulation activity yet"
      />
    );
  }

  return (
    <Card className="overflow-hidden p-5">
      <h2 className="text-sm font-semibold text-slate-100">Simulation Activity</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-slate-500">
              <th className="py-3 pr-4 font-semibold">Simulation</th>
              <th className="px-4 py-3 font-semibold">Target Market</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Success Score</th>
              <th className="px-4 py-3 font-semibold">Revenue Forecast</th>
              <th className="py-3 pl-4 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/80">
            {rows.map((row) => (
              <tr className="text-slate-300 transition hover:bg-white/[0.03]" key={row.simulation}>
                <td className="py-4 pr-4 font-medium text-slate-100">{row.simulation}</td>
                <td className="px-4 py-4">{row.targetMarket}</td>
                <td className="px-4 py-4">
                  <Badge tone={row.status === "Completed" ? "success" : "purple"}>
                    {row.status}
                  </Badge>
                </td>
                <td className="px-4 py-4">{row.successScore}</td>
                <td className="px-4 py-4">{row.revenueForecast}</td>
                <td className="py-4 pl-4">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
