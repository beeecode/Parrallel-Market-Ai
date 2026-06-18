"use client";

import { Tabs } from "@/components/ui/Tabs";
import { simulationTabs } from "@/constants/tabs";
import type { SimulationTabId } from "@/types/simulation";

type LiveSimulationTabsProps = {
  activeTab: SimulationTabId;
  onTabChange: (tab: SimulationTabId) => void;
};

export function LiveSimulationTabs({ activeTab, onTabChange }: LiveSimulationTabsProps) {
  return (
    <div className="border-b border-border px-5 py-3">
      <Tabs
        activeTab={activeTab}
        ariaLabel="Live simulation sections"
        onTabChange={onTabChange}
        tabs={simulationTabs}
      />
    </div>
  );
}
