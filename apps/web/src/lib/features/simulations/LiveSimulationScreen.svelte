<script lang="ts">
	import ActivityFeed from '$lib/components/simulations/ActivityFeed.svelte';
	import ChatThread from '$lib/components/simulations/ChatThread.svelte';
	import CustomerAgentList from '$lib/components/simulations/CustomerAgentList.svelte';
	import LiveSimulationHeader from '$lib/components/simulations/LiveSimulationHeader.svelte';
	import MessageInput from '$lib/components/simulations/MessageInput.svelte';
	import SimulationStats from '$lib/components/simulations/SimulationStats.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import { simulationTabs } from '$lib/constants/tabs';
	import { getLiveSimulationData } from '$lib/data/simulation';
	import type { ChatMessage, SimulationTabId } from '$lib/types/simulation';
	import { getCurrentTimeLabel } from '$lib/utils/format';
	import { validateMessage } from '$lib/validation/message';

	const simulationData = getLiveSimulationData();

	let activeTab = $state<SimulationTabId>('live-chat');
	let activeAgentId = $state(simulationData.agents[0]?.id ?? '');
	let messages = $state<ChatMessage[]>([...simulationData.messages]);
	let draft = $state('');
	let error = $state<string | undefined>();

	function handleTabChange(tab: string): void {
		activeTab = tab as SimulationTabId;
	}

	function handleSendMessage(): void {
		const result = validateMessage(draft);

		if (!result.valid) {
			error = result.error;
			return;
		}

		messages = [
			...messages,
			{
				id: `local-${Date.now()}`,
				sender: 'business',
				body: draft.trim(),
				timestamp: getCurrentTimeLabel()
			}
		];
		draft = '';
		error = undefined;
	}
</script>

<Card class="overflow-hidden">
	<LiveSimulationHeader
		elapsedTime={simulationData.elapsedTime}
		status={simulationData.status}
		title={simulationData.title}
	/>
	<Tabs
		{activeTab}
		ariaLabel="Live simulation views"
		onchange={handleTabChange}
		tabs={simulationTabs}
	/>

	{#if activeTab === 'live-chat'}
		<div class="grid min-h-[34rem] min-w-0 max-w-full md:grid-cols-[19rem_minmax(0,1fr)]">
			<CustomerAgentList
				{activeAgentId}
				agents={simulationData.agents}
				onselect={(id) => (activeAgentId = id)}
			/>
			<div class="flex min-w-0 flex-col">
				<ChatThread {messages} />
				<MessageInput
					{error}
					onchange={(value) => {
						draft = value;
						if (error) error = undefined;
					}}
					onsubmit={handleSendMessage}
					value={draft}
				/>
			</div>
		</div>
	{:else if activeTab === 'customer-agents'}
		<SimulationStats agents={simulationData.agents} stats={simulationData.stats} />
	{:else if activeTab === 'activity-feed'}
		<ActivityFeed activity={simulationData.activity} />
	{:else}
		<SimulationStats stats={simulationData.stats} />
	{/if}
</Card>
