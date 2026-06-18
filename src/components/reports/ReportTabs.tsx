"use client";

import { Tabs } from "@/components/ui/Tabs";
import { reportTabs } from "@/constants/tabs";
import type { ReportTabId } from "@/types/report";

type ReportTabsProps = {
  activeTab: ReportTabId;
  onTabChange: (tab: ReportTabId) => void;
};

export function ReportTabs({ activeTab, onTabChange }: ReportTabsProps) {
  return (
    <div className="border-b border-border px-5 py-3">
      <Tabs
        activeTab={activeTab}
        ariaLabel="Simulation report sections"
        onTabChange={onTabChange}
        tabs={reportTabs}
      />
    </div>
  );
}
