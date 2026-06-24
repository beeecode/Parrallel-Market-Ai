<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import ErrorState from '$lib/components/ui/ErrorState.svelte';
	import LoadingState from '$lib/components/ui/LoadingState.svelte';
	import type { LoadState } from '$lib/types/common';
	import type { SimulationActivity } from '$lib/types/dashboard';

	let {
		rows,
		state = 'ready',
		onretry
	}: { rows: SimulationActivity[]; state?: LoadState; onretry?: () => void } = $props();
</script>

{#if state === 'loading'}
	<LoadingState label="Loading simulation activity..." />
{:else if state === 'error'}
	<ErrorState description="Simulation activity could not be loaded." {onretry} />
{:else if state === 'empty' || rows.length === 0}
	<EmptyState
		description="Completed simulations will appear here with market, status, score, forecast, and date."
		title="No simulation activity yet"
	/>
{:else}
	<Card class="overflow-hidden p-5">
		<h2 class="text-sm font-semibold text-slate-100">Simulation Activity</h2>

		<div class="mt-4 hidden overflow-x-auto md:block">
			<table class="w-full min-w-[720px] text-left text-xs">
				<thead>
					<tr class="border-b border-border/90 text-[11px] text-slate-500">
						<th class="py-3 pr-4 font-semibold">Simulation</th>
						<th class="px-4 py-3 font-semibold">Target Market</th>
						<th class="px-4 py-3 font-semibold">Status</th>
						<th class="px-4 py-3 font-semibold">Success Score</th>
						<th class="px-4 py-3 font-semibold">Revenue Forecast</th>
						<th class="py-3 pl-4 font-semibold">Date</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border/65">
					{#each rows as row (row.simulation)}
						<tr class="text-slate-300 transition hover:bg-white/[0.025]">
							<td class="py-4 pr-4 font-medium text-slate-100">{row.simulation}</td>
							<td class="px-4 py-4">{row.targetMarket}</td>
							<td class="px-4 py-4">
								<Badge tone={row.status === 'Completed' ? 'success' : 'purple'}>
									{row.status}
								</Badge>
							</td>
							<td class="px-4 py-4">{row.successScore}</td>
							<td class="px-4 py-4">{row.revenueForecast}</td>
							<td class="py-4 pl-4">{row.date}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="mt-4 divide-y divide-border/65 md:hidden">
			{#each rows as row (row.simulation)}
				<article class="space-y-3 py-4 first:pt-1">
					<div class="flex items-start justify-between gap-3">
						<div>
							<h3 class="text-sm font-semibold text-slate-100">{row.simulation}</h3>
							<p class="mt-1 text-xs text-slate-500">{row.targetMarket}</p>
						</div>
						<Badge tone="success">{row.status}</Badge>
					</div>
					<dl class="grid grid-cols-2 gap-3 text-xs">
						<div>
							<dt class="text-slate-500">Success score</dt>
							<dd class="mt-1 text-slate-200">{row.successScore}</dd>
						</div>
						<div>
							<dt class="text-slate-500">Revenue</dt>
							<dd class="mt-1 text-slate-200">{row.revenueForecast}</dd>
						</div>
					</dl>
				</article>
			{/each}
		</div>
	</Card>
{/if}
