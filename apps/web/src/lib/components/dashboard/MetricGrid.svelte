<script lang="ts">
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import ErrorState from '$lib/components/ui/ErrorState.svelte';
	import LoadingState from '$lib/components/ui/LoadingState.svelte';
	import MetricCard from '$lib/components/dashboard/MetricCard.svelte';
	import type { LoadState } from '$lib/types/common';
	import type { Metric } from '$lib/types/dashboard';

	let {
		metrics,
		state = 'ready',
		onretry
	}: { metrics: Metric[]; state?: LoadState; onretry?: () => void } = $props();
</script>

{#if state === 'loading'}
	<LoadingState label="Loading performance metrics..." />
{:else if state === 'error'}
	<ErrorState description="Metrics could not be prepared from the local dataset." {onretry} />
{:else if state === 'empty' || metrics.length === 0}
	<EmptyState
		description="Run a simulation to see customer volume, conversations, purchase rate, and repeat rate."
		title="No metrics yet"
	/>
{:else}
	<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
		{#each metrics as metric (metric.label)}
			<MetricCard {metric} />
		{/each}
	</div>
{/if}
