import Image from "next/image";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { Metric } from "@/types/dashboard";

type MetricCardProps = {
  metric: Metric;
};

export function MetricCard({ metric }: MetricCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-slate-400">{metric.label}</p>
        {metric.iconSrc ? (
          <Image
            alt={metric.iconAlt ?? ""}
            className="h-10 w-10 shrink-0 object-contain opacity-90"
            height={44}
            src={metric.iconSrc}
            width={44}
          />
        ) : null}
      </div>
      <p
        className={cn(
          "mt-3 text-2xl font-bold tracking-tight",
          metric.tone === "primary" && "text-brand-light",
          metric.tone === "success" && "text-success",
          (!metric.tone || metric.tone === "neutral") && "text-slate-50",
        )}
      >
        {metric.value}
      </p>
    </Card>
  );
}
