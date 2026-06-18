import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatPercent } from "@/lib/utils";

type SuccessProbabilityCardProps = {
  value: number;
  description: string;
};

export function SuccessProbabilityCard({ value, description }: SuccessProbabilityCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-sm font-semibold text-slate-100">Success Probability</h2>
        <Image
          alt="3D target icon"
          className="h-14 w-14 object-contain opacity-90"
          height={64}
          priority
          src="/assets/3d/illustrations/bullseye.png"
          width={64}
        />
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-[8.5rem_1fr] sm:items-center">
        <div
          aria-label={`Success probability ${value}%`}
          className="relative grid h-32 w-32 place-items-center rounded-full"
          role="img"
          style={{
            background: `conic-gradient(#7C3AED 0 ${value}%, #22C55E ${value}% ${
              value + 14
            }%, #26314A ${value + 14}% 100%)`,
          }}
        >
          <div className="grid h-[6.45rem] w-[6.45rem] place-items-center rounded-full bg-ink-850 shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]">
            <span className="text-3xl font-bold text-slate-50">{formatPercent(value)}</span>
          </div>
        </div>
        <div className="space-y-5">
          <p className="max-w-xs text-sm leading-6 text-slate-300">{description}</p>
          <Button size="sm">View Full Report</Button>
        </div>
      </div>
    </Card>
  );
}
