"use client";

import { useState } from "react";

import { FeedbackPanel } from "@/components/reports/FeedbackPanel";
import { ObjectionPanel } from "@/components/reports/ObjectionPanel";
import { PricingIntelligencePanel } from "@/components/reports/PricingIntelligencePanel";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { ReportSuccessCard } from "@/components/reports/ReportSuccessCard";
import { ReportTabs } from "@/components/reports/ReportTabs";
import { SentimentCard } from "@/components/reports/SentimentCard";
import { Card } from "@/components/ui/Card";
import { getReportData } from "@/services/dummy-data/report-data";
import type { ReportTabId } from "@/types/report";

const reportData = getReportData();

function OverviewContent() {
  return (
    <div className="space-y-5 p-5">
      <div className="grid gap-5 lg:grid-cols-[0.78fr_1.45fr]">
        <ReportSuccessCard
          label={reportData.successLabel}
          value={reportData.successProbability}
        />
        <SentimentCard sentiment={reportData.sentiment} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <FeedbackPanel
          items={reportData.positiveFeedback}
          title="Top Positive Feedback"
        />
        <ObjectionPanel items={reportData.objections} title="Top Customer Objections" />
      </div>
      <PricingIntelligencePanel
        currentAveragePrice={reportData.currentAveragePrice}
        optimalPriceRange={reportData.optimalPriceRange}
      />
    </div>
  );
}

function RecommendationsContent() {
  return (
    <div className="grid gap-5 p-5 lg:grid-cols-2">
      <FeedbackPanel items={reportData.recommendations} title="Recommendations" />
      <ObjectionPanel items={reportData.risks} title="Risk Factors" />
    </div>
  );
}

function ReportTabContent({ activeTab }: { activeTab: ReportTabId }) {
  if (activeTab === "overview") {
    return <OverviewContent />;
  }

  if (activeTab === "customer-insights") {
    return (
      <div className="grid gap-5 p-5 lg:grid-cols-[1.35fr_1fr]">
        <SentimentCard sentiment={reportData.sentiment} />
        <FeedbackPanel
          items={reportData.positiveFeedback}
          title="Top Positive Feedback"
        />
      </div>
    );
  }

  if (activeTab === "pricing-analysis") {
    return (
      <div className="p-5">
        <PricingIntelligencePanel
          currentAveragePrice={reportData.currentAveragePrice}
          optimalPriceRange={reportData.optimalPriceRange}
        />
      </div>
    );
  }

  if (activeTab === "recommendations") {
    return <RecommendationsContent />;
  }

  return (
    <div className="p-5">
      <ObjectionPanel items={reportData.risks} title="Risk Factors" />
    </div>
  );
}

export function ReportScreen() {
  const [activeTab, setActiveTab] = useState<ReportTabId>("overview");

  return (
    <Card className="min-h-[calc(100vh-7rem)] overflow-hidden">
      <ReportHeader title={reportData.title} />
      <ReportTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <ReportTabContent activeTab={activeTab} />
    </Card>
  );
}
