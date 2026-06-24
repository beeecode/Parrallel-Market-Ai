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
	import { getDashboardData } from '$lib/data/dashboard';

	const data = getDashboardData();
</script>

<div>
	<PageHeader subtitle="Overview of your simulation performance" title="Dashboard">
		{#snippet actions()}
			<Button onclick={() => goto(resolve('/simulations'))}>
				<Plus aria-hidden="true" size={17} strokeWidth={2} />
				New Simulation
			</Button>
		{/snippet}
	</PageHeader>

	<div class="grid gap-5 xl:grid-cols-2">
		<SuccessProbabilityCard description={data.successCopy} value={data.successProbability} />
		<RevenueForecastCard
			forecast={data.revenueForecast}
			subtitle={data.revenueSubtitle}
			trend={data.revenueTrend}
		/>
	</div>

	<div class="mt-5">
		<MetricGrid metrics={data.metrics} />
	</div>

	<div class="mt-5">
		<SimulationActivityTable rows={data.activity} />
	</div>
</div>
