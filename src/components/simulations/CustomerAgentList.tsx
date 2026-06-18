import Image from "next/image";

import { cn } from "@/lib/utils";
import type { CustomerAgent } from "@/types/simulation";

type CustomerAgentListProps = {
  agents: CustomerAgent[];
  activeAgentId?: string;
};

export function CustomerAgentList({ agents, activeAgentId = agents[0]?.id }: CustomerAgentListProps) {
  return (
    <aside className="border-b border-border bg-ink-900/45 md:border-b-0 md:border-r">
      <div className="max-h-72 overflow-y-auto md:max-h-none">
        {agents.map((agent) => {
          const isActive = activeAgentId === agent.id;

          return (
            <article
              className={cn(
                "flex gap-3 border-b border-border/65 px-4 py-4 transition",
                isActive ? "bg-white/[0.045]" : "hover:bg-white/[0.03]",
              )}
              key={agent.id}
            >
              <Image
                alt={agent.avatarAlt}
                className="h-9 w-9 shrink-0 rounded-full border border-border bg-ink-800 object-cover"
                height={36}
                src={agent.avatarSrc}
                unoptimized
                width={36}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-slate-100">
                    {agent.name} <span className="text-slate-500">(Age {agent.age})</span>
                  </p>
                  <span className="shrink-0 text-[11px] text-slate-500">{agent.lastSeen}</span>
                </div>
                <p className="mt-1 truncate text-xs text-slate-400">{agent.preview}</p>
              </div>
            </article>
          );
        })}
      </div>
    </aside>
  );
}
