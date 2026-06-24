import Image from "next/image";

import { Card } from "@/components/ui/Card";

type RevenueForecastCardProps = {
  forecast: string;
  subtitle: string;
  trend: number[];
};

function buildLinePath(values: number[], width: number, height: number): string {
  if (values.length === 0) {
    return "";
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const step = values.length > 1 ? width / (values.length - 1) : width;

  return values
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * (height - 12) - 6;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export function RevenueForecastCard({ forecast, subtitle, trend }: RevenueForecastCardProps) {
  const width = 360;
  const height = 138;
  const linePath = buildLinePath(trend, width, height);
  const areaPath = linePath ? `${linePath} L ${width} ${height} L 0 ${height} Z` : "";

  return (
    <Card className="overflow-hidden p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Revenue Forecast</h2>
          <p className="mt-7 text-3xl font-bold tracking-tight text-brand-light">{forecast}</p>
          <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
        </div>
        <Image
          alt="3D chart icon"
          className="mt-1 h-14 w-14 object-contain opacity-90"
          height={64}
          priority
          src="/assets/3d/illustrations/chart-increasing.png"
          width={64}
        />
      </div>
      <div className="mt-4 h-28 overflow-hidden rounded-xl">
        <svg
          aria-label="Revenue forecast trend"
          className="h-full w-full"
          preserveAspectRatio="none"
          role="img"
          viewBox={`0 0 ${width} ${height}`}
        >
          <defs>
            <linearGradient id="revenue-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.42" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
            </linearGradient>
            <filter id="revenue-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" />
            </filter>
          </defs>
          <path d={areaPath} fill="url(#revenue-area)" />
          <path
            d={linePath}
            fill="none"
            filter="url(#revenue-glow)"
            stroke="#A855F7"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.14"
            strokeWidth="4"
          />
          <path
            d={linePath}
            fill="none"
            stroke="#A855F7"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />
        </svg>
      </div>
    </Card>
  );
}
