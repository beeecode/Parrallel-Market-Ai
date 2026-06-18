"use client";

import { cn } from "@/lib/utils";

export type TabItem<T extends string> = {
  id: T;
  label: string;
};

type TabsProps<T extends string> = {
  tabs: Array<TabItem<T>>;
  activeTab: T;
  onTabChange: (tab: T) => void;
  ariaLabel: string;
  className?: string;
};

export function Tabs<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  ariaLabel,
  className,
}: TabsProps<T>) {
  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        "flex overflow-x-auto rounded-xl border border-border bg-ink-950/35 p-1",
        className,
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            aria-selected={isActive}
            className={cn(
              "relative min-h-9 whitespace-nowrap rounded-lg px-4 text-xs font-semibold text-slate-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
              isActive
                ? "bg-brand-soft text-purple-100 shadow-[inset_0_-2px_0_#A855F7]"
                : "hover:bg-white/5 hover:text-slate-200",
            )}
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
