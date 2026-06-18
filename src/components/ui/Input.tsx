import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-border bg-ink-950/55 px-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-brand-light focus:ring-2 focus:ring-brand-light/30",
        className,
      )}
      {...props}
    />
  );
}
