import { Badge } from "@/components/ui/Badge";

type LiveSimulationHeaderProps = {
  title: string;
  status: "Running" | "Paused" | "Completed";
  elapsedTime: string;
};

export function LiveSimulationHeader({
  title,
  status,
  elapsedTime,
}: LiveSimulationHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-brand-light/35 bg-brand-soft text-brand-light shadow-glow">
          <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
            <path
              d="M7 8.5 12 5l5 3.5M7 15.5 12 19l5-3.5M7 8.5v7m10-7v7M7 8.5 12 12l5-3.5M7 15.5 12 12l5 3.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        </div>
        <h1 className="truncate text-base font-bold text-slate-50 sm:text-lg">{title}</h1>
        <Badge tone="success">{status}</Badge>
      </div>
      <p className="text-xs font-medium text-slate-400">Time Elapsed: {elapsedTime}</p>
    </div>
  );
}
