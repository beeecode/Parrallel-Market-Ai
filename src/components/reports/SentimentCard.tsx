import { Card } from "@/components/ui/Card";
import type { SentimentPoint } from "@/types/report";

type SentimentCardProps = {
  sentiment: SentimentPoint[];
};

function buildSentimentGradient(sentiment: SentimentPoint[]): string {
  let start = 0;

  const segments = sentiment.map((point) => {
    const end = start + point.value;
    const segment = `${point.color} ${start}% ${end}%`;
    start = end;
    return segment;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

export function SentimentCard({ sentiment }: SentimentCardProps) {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-semibold text-slate-100">Customer Sentiment</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-[7.5rem_1fr] sm:items-center">
        <div
          aria-label="Customer sentiment distribution"
          className="grid h-28 w-28 place-items-center rounded-full"
          role="img"
          style={{ background: buildSentimentGradient(sentiment) }}
        >
          <div className="h-[4.9rem] w-[4.9rem] rounded-full bg-ink-850" />
        </div>
        <dl className="space-y-4">
          {sentiment.map((point) => (
            <div className="grid grid-cols-[1fr_auto] items-center gap-4" key={point.label}>
              <dt className="flex items-center gap-3 text-sm text-slate-300">
                <span
                  aria-hidden="true"
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: point.color }}
                />
                {point.label}
              </dt>
              <dd className="text-sm font-semibold text-slate-100">{point.value}%</dd>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  );
}
