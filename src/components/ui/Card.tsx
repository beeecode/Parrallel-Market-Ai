import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  interactive?: boolean;
};

export function Card({ children, className, interactive = false, ...props }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-panel-glow shadow-panel backdrop-blur-md",
        interactive &&
          "transition duration-200 hover:-translate-y-0.5 hover:border-brand-light/45 hover:shadow-panel",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}
