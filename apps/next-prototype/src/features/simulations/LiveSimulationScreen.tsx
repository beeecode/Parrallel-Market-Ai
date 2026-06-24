"use client";

import { useState } from "react";

import { ActivityFeed } from "@/components/simulations/ActivityFeed";
import { ChatThread } from "@/components/simulations/ChatThread";
import { CustomerAgentList } from "@/components/simulations/CustomerAgentList";
import { LiveSimulationHeader } from "@/components/simulations/LiveSimulationHeader";
import { LiveSimulationTabs } from "@/components/simulations/LiveSimulationTabs";
import { MessageInput } from "@/components/simulations/MessageInput";
import { SimulationStats } from "@/components/simulations/SimulationStats";
import { Card } from "@/components/ui/Card";
import { getLiveSimulationData } from "@/services/dummy-data/simulation-data";
import type { ChatMessage, SimulationTabId } from "@/types/simulation";
import { validateMessage } from "@/validation/message";

const simulationData = getLiveSimulationData();

function getCurrentTimeLabel(): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LiveSimulationScreen() {
  const [activeTab, setActiveTab] = useState<SimulationTabId>("live-chat");
  const [messages, setMessages] = useState<ChatMessage[]>(simulationData.messages);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | undefined>();

  function handleSendMessage() {
    const result = validateMessage(draft);

    if (!result.valid) {
      setError(result.error);
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `local-${Date.now()}`,
        sender: "business",
        body: draft.trim(),
        timestamp: getCurrentTimeLabel(),
      },
    ]);
    setDraft("");
    setError(undefined);
  }

  return (
    <Card className="min-h-[calc(100vh-7rem)] overflow-hidden">
      <LiveSimulationHeader
        elapsedTime={simulationData.elapsedTime}
        status={simulationData.status}
        title={simulationData.title}
      />
      <LiveSimulationTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "live-chat" ? (
        <div className="grid min-h-[34rem] md:grid-cols-[20rem_1fr]">
          <CustomerAgentList agents={simulationData.agents} />
          <div className="flex min-w-0 flex-col">
            <ChatThread messages={messages} />
            <MessageInput
              error={error}
              onChange={(value) => {
                setDraft(value);
                if (error) {
                  setError(undefined);
                }
              }}
              onSubmit={handleSendMessage}
              value={draft}
            />
          </div>
        </div>
      ) : null}

      {activeTab === "customer-agents" ? (
        <SimulationStats agents={simulationData.agents} stats={simulationData.stats} />
      ) : null}

      {activeTab === "activity-feed" ? (
        <ActivityFeed activity={simulationData.activity} />
      ) : null}

      {activeTab === "simulation-stats" ? (
        <SimulationStats stats={simulationData.stats} />
      ) : null}
    </Card>
  );
}
