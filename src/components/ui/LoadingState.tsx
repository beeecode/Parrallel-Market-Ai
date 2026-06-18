import { cn } from "@/lib/utils";

type LoadingStateProps = {
  label?: string;
  className?: string;
};

export function LoadingState({ label = "Loading data...", className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-32 items-center justify-center rounded-2xl border border-border bg-ink-900/45 p-6 text-sm text-slate-400",
        className,
      )}
      role="status"
    >
      <span className="mr-3 h-2.5 w-2.5 animate-pulse rounded-full bg-brand-light shadow-glow" />
      {label}
    </div>
  );
}
