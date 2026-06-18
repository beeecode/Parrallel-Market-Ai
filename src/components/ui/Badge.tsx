import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type BadgeTone = "success" | "purple" | "warning" | "danger" | "neutral";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tone?: BadgeTone;
};

const toneClasses: Record<BadgeTone, string> = {
  success: "border-success/30 bg-success/10 text-green-300",
  purple: "border-brand-light/30 bg-brand-soft text-purple-200",
  warning: "border-warning/30 bg-warning/10 text-yellow-200",
  danger: "border-danger/30 bg-danger/10 text-red-200",
  neutral: "border-slate-500/30 bg-slate-500/10 text-slate-300",
};

export function Badge({ children, className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-semibold leading-none",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
