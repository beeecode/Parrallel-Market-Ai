import { Card } from "@/components/ui/Card";
import { formatPercent } from "@/lib/utils";

type ReportSuccessCardProps = {
  value: number;
  label: string;
};

export function ReportSuccessCard({ value, label }: ReportSuccessCardProps) {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-semibold text-slate-100">Success Probability</h2>
      <div className="mt-6 flex items-center gap-5">
        <div
          aria-label={`Success probability ${value}%`}
          className="grid h-24 w-24 shrink-0 place-items-center rounded-full"
          role="img"
          style={{
            background: `conic-gradient(#22C55E 0 ${value}%, #27314A ${value}% 100%)`,
          }}
        >
          <div className="grid h-[4.7rem] w-[4.7rem] place-items-center rounded-full bg-ink-850">
            <span className="text-2xl font-bold text-slate-50">{formatPercent(value)}</span>
          </div>
        </div>
        <p className="max-w-36 text-sm font-semibold leading-6 text-slate-300">{label}</p>
      </div>
    </Card>
  );
}
