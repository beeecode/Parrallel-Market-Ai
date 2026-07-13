<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Plus } from 'lucide-svelte';

	import MetricGrid from '$lib/components/dashboard/MetricGrid.svelte';
	import RevenueForecastCard from '$lib/components/dashboard/RevenueForecastCard.svelte';
	import SimulationActivityTable from '$lib/components/dashboard/SimulationActivityTable.svelte';
	import SuccessProbabilityCard from '$lib/components/dashboard/SuccessProbabilityCard.svelte';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import type { DashboardViewModel } from '$lib/types/dashboard';

	let { dashboard }: { dashboard: DashboardViewModel | null } = $props();
</script>

<div>
	<PageHeader subtitle="Overview of your simulation performance" title="Dashboard">
		{#snippet actions()}
			<Button onclick={() => goto(resolve('/simulations/new'))}>
				<Plus aria-hidden="true" size={17} strokeWidth={2} />
				New Simulation
			</Button>
		{/snippet}
	</PageHeader>

	{#if dashboard}
		<div class="grid gap-5 xl:grid-cols-2">
			<SuccessProbabilityCard
				description={dashboard.successCopy}
				value={dashboard.successProbability}
			/>
			<RevenueForecastCard
				forecast={dashboard.revenueForecast}
				subtitle={dashboard.revenueSubtitle}
				trend={dashboard.revenueTrend}
			/>
		</div>

		<div class="mt-5">
			<MetricGrid metrics={dashboard.metrics} />
		</div>

		<div class="mt-5">
			<SimulationActivityTable rows={dashboard.activity} />
		</div>
	{:else}
		<EmptyState
			class="mt-6"
			description="Create or complete a market simulation to see performance metrics and activity."
			title="No accessible simulations"
		/>
	{/if}
</div>
