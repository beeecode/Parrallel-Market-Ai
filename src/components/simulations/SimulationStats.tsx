import Image from "next/image";

import { Card } from "@/components/ui/Card";
import type { CustomerAgent, SimulationStat } from "@/types/simulation";

type SimulationStatsProps = {
  stats: SimulationStat[];
  agents?: CustomerAgent[];
};

export function SimulationStats({ stats, agents }: SimulationStatsProps) {
  return (
    <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
      {agents
        ? agents.map((agent) => (
            <Card className="p-4" key={agent.id}>
              <div className="flex items-center gap-3">
                <Image
                  alt={agent.avatarAlt}
                  className="h-10 w-10 shrink-0 rounded-full border border-border bg-ink-800 object-cover"
                  height={40}
                  src={agent.avatarSrc}
                  unoptimized
                  width={40}
                />
                <div>
                  <p className="font-semibold text-slate-100">
                    {agent.name} <span className="text-slate-500">(Age {agent.age})</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{agent.preview}</p>
                </div>
              </div>
            </Card>
          ))
        : stats.map((stat) => (
            <Card className="p-5" key={stat.label}>
              <p className="text-xs font-medium text-slate-400">{stat.label}</p>
              <p className="mt-3 text-3xl font-bold text-brand-light">{stat.value}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{stat.detail}</p>
            </Card>
          ))}
    </div>
  );
}
