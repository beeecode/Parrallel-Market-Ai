<script lang="ts">
	import ActivityFeed from '$lib/components/simulations/ActivityFeed.svelte';
	import ChatThread from '$lib/components/simulations/ChatThread.svelte';
	import CustomerAgentList from '$lib/components/simulations/CustomerAgentList.svelte';
	import LiveSimulationHeader from '$lib/components/simulations/LiveSimulationHeader.svelte';
	import MessageInput from '$lib/components/simulations/MessageInput.svelte';
	import SimulationStats from '$lib/components/simulations/SimulationStats.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import { simulationTabs } from '$lib/constants/tabs';
	import type {
		ChatMessage,
		SimulationTabId,
		SimulationWorkspaceViewModel
	} from '$lib/types/simulation';

	let {
		simulationData,
		messageDraft,
		messageError
	}: {
		simulationData: SimulationWorkspaceViewModel | null;
		messageDraft?: string;
		messageError?: string;
	} = $props();

	let activeTab = $state<SimulationTabId>('live-chat');
	let activeAgentId = $state('');
	let draft = $state('');
	let confirmedMessagesByThread = $state<Record<string, ChatMessage[]>>({});

	$effect(() => {
		if (
			simulationData &&
			(!activeAgentId || !simulationData.agents.some((agent) => agent.id === activeAgentId))
		) {
			activeAgentId = simulationData.activeAgentId;
		}
	});

	$effect(() => {
		if (messageDraft !== undefined) {
			draft = messageDraft;
		}
	});

	const activeAgent = $derived(simulationData?.agents.find((agent) => agent.id === activeAgentId));
	const activeThreadKey = $derived(
		simulationData && activeAgentId ? `${simulationData.simulationId}:${activeAgentId}` : ''
	);
	const serverMessages = $derived(simulationData?.messagesByAgent[activeAgentId] ?? []);
	const messages = $derived(
		mergeMessages(
			serverMessages,
			activeThreadKey ? (confirmedMessagesByThread[activeThreadKey] ?? []) : []
		)
	);

	function handleTabChange(tab: string): void {
		activeTab = tab as SimulationTabId;
	}

	function mergeMessages(
		serverMessages: ChatMessage[],
		confirmedMessages: ChatMessage[]
	): ChatMessage[] {
		const merged: ChatMessage[] = [];

		for (const message of [...serverMessages, ...confirmedMessages]) {
			if (!merged.some((existing) => existing.id === message.id)) {
				merged.push(message);
			}
		}

		return merged.sort(
			(left, right) => new Date(left.sentAt).getTime() - new Date(right.sentAt).getTime()
		);
	}

	function handleMessageSent(message: ChatMessage): void {
		if (!activeThreadKey) return;

		const existingMessages = mergeMessages(
			serverMessages,
			confirmedMessagesByThread[activeThreadKey] ?? []
		);
		if (existingMessages.some((existing) => existing.id === message.id)) return;

		confirmedMessagesByThread = {
			...confirmedMessagesByThread,
			[activeThreadKey]: [...(confirmedMessagesByThread[activeThreadKey] ?? []), message]
		};
	}
</script>

{#if simulationData}
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
			{#if simulationData.agents.length === 0}
				<EmptyState
					class="m-5"
					description="This simulation is saved as a draft. Customer agents will appear after the simulation engine is implemented."
					title="No customer agents yet"
				/>
			{:else}
				<div class="grid min-h-[34rem] min-w-0 max-w-full md:grid-cols-[19rem_minmax(0,1fr)]">
					<CustomerAgentList
						{activeAgentId}
						agents={simulationData.agents}
						onselect={(id) => (activeAgentId = id)}
					/>
					<div class="flex min-w-0 flex-col">
						{#if activeAgent?.conversationId}
							<ChatThread {messages} />
						{:else}
							<EmptyState
								class="m-5"
								description="This customer agent does not have a conversation record yet."
								title="No conversation"
							/>
						{/if}
						<MessageInput
							agentId={activeAgentId}
							conversationId={activeAgent?.conversationId}
							error={messageError}
							onchange={(value) => (draft = value)}
							onsent={handleMessageSent}
							simulationId={simulationData.simulationId}
							value={draft}
						/>
					</div>
				</div>
			{/if}
		{:else if activeTab === 'customer-agents'}
			{#if simulationData.agents.length === 0}
				<EmptyState
					class="m-5"
					description="Customer agents are not generated during this frontend phase."
					title="No customer agents yet"
				/>
			{:else}
				<SimulationStats agents={simulationData.agents} stats={simulationData.stats} />
			{/if}
		{:else if activeTab === 'activity-feed'}
			<ActivityFeed activity={simulationData.activity} />
		{:else}
			<SimulationStats stats={simulationData.stats} />
		{/if}
	</Card>
{:else}
	<EmptyState
		description="No running or completed simulation is available for your account."
		title="No accessible simulation"
	/>
{/if}
