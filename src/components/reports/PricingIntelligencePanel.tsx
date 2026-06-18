import { Card } from "@/components/ui/Card";

type PricingIntelligencePanelProps = {
  optimalPriceRange: string;
  currentAveragePrice: string;
};

export function PricingIntelligencePanel({
  optimalPriceRange,
  currentAveragePrice,
}: PricingIntelligencePanelProps) {
  return (
    <Card className="overflow-hidden p-5">
      <h2 className="text-lg font-semibold text-slate-100">Pricing Intelligence</h2>
      <div className="mt-5 grid gap-6 lg:grid-cols-[18rem_1fr] lg:items-end">
        <div>
          <p className="text-sm text-slate-300">Optimal Price Range</p>
          <p className="mt-2 text-2xl font-bold text-success">{optimalPriceRange}</p>
          <p className="mt-2 text-sm text-slate-500">Current Avg. Price: {currentAveragePrice}</p>
        </div>
        <div className="relative h-36 overflow-hidden rounded-xl">
          <svg
            aria-label="Demand curve"
            className="h-full w-full"
            preserveAspectRatio="none"
            role="img"
            viewBox="0 0 520 160"
          >
            <defs>
              <linearGradient id="demand-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" stopOpacity="0.34" />
                <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M18 136 C 110 132, 145 102, 200 76 C 252 52, 282 54, 334 85 C 385 116, 433 132, 502 137 L 502 160 L 18 160 Z"
              fill="url(#demand-area)"
            />
            <path
              d="M18 136 C 110 132, 145 102, 200 76 C 252 52, 282 54, 334 85 C 385 116, 433 132, 502 137"
              fill="none"
              stroke="#86EFAC"
              strokeLinecap="round"
              strokeWidth="3"
            />
            <path d="M262 46V145" stroke="#86EFAC" strokeDasharray="4 4" strokeOpacity="0.55" />
          </svg>
          <p className="absolute right-4 top-8 max-w-36 text-sm font-medium leading-5 text-green-300">
            Demand is highest in this range
          </p>
        </div>
      </div>
    </Card>
  );
}
