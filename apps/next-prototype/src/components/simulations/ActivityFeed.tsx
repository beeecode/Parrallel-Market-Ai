import { Badge } from "@/components/ui/Badge";
import type { ActivityEvent } from "@/types/simulation";

type ActivityFeedProps = {
  activity: ActivityEvent[];
};

export function ActivityFeed({ activity }: ActivityFeedProps) {
  return (
    <div className="grid gap-3 p-5">
      {activity.map((event) => (
        <article
          className="rounded-2xl border border-border bg-ink-900/55 p-4"
          key={event.id}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">{event.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{event.description}</p>
            </div>
            <Badge
              tone={
                event.tone === "success"
                  ? "success"
                  : event.tone === "warning"
                    ? "warning"
                    : "neutral"
              }
            >
              {event.timestamp}
            </Badge>
          </div>
        </article>
      ))}
    </div>
  );
}
