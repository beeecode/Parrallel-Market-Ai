<script lang="ts">
	import { AlertTriangle, Lightbulb, TrendingUp } from 'lucide-svelte';

	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import type { InsightDashboardViewModel } from '$lib/types/insight';

	let { insights }: { insights: InsightDashboardViewModel | null } = $props();
</script>

<div>
	<PageHeader subtitle="Market intelligence across your simulations" title="Insights" />

	{#if !insights}
		<EmptyState
			description="Completed reports are needed before cross-simulation insights can be derived."
			title="No insights yet"
		/>
	{:else}
		<div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
			{#each insights.cards as card (card.id)}
				<Card class="p-5">
					<div class="flex items-start justify-between gap-3">
						<div
							class="grid h-10 w-10 place-items-center rounded-md border border-border bg-ink-950/55 text-brand-light"
						>
							<TrendingUp aria-hidden="true" size={18} />
						</div>
						<Badge tone={card.tone}>{card.title}</Badge>
					</div>
					<p class="mt-5 text-2xl font-bold text-slate-50">{card.value}</p>
					<p class="mt-3 text-sm leading-6 text-slate-400">{card.description}</p>
				</Card>
			{/each}
		</div>

		<div class="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
			<Card class="p-5">
				<div class="flex items-center gap-3">
					<div
						class="grid h-10 w-10 place-items-center rounded-md border border-success/30 bg-success/10 text-green-300"
					>
						<Lightbulb aria-hidden="true" size={18} />
					</div>
					<div>
						<h2 class="text-sm font-semibold text-slate-100">Recommendations summary</h2>
						<p class="mt-1 text-xs text-slate-500">{insights.summary}</p>
					</div>
				</div>
				{#if insights.recommendations.length === 0}
					<EmptyState
						class="mt-4"
						description="Recommendations will appear when report data includes them."
						title="No recommendations"
					/>
				{:else}
					<ul class="mt-5 space-y-3">
						{#each insights.recommendations as recommendation (recommendation)}
							<li
								class="rounded-md border border-border/70 bg-ink-950/35 p-3 text-sm text-slate-300"
							>
								{recommendation}
							</li>
						{/each}
					</ul>
				{/if}
			</Card>

			<Card class="p-5">
				<div class="flex items-center gap-3">
					<div
						class="grid h-10 w-10 place-items-center rounded-md border border-warning/30 bg-warning/10 text-yellow-200"
					>
						<AlertTriangle aria-hidden="true" size={18} />
					</div>
					<div>
						<h2 class="text-sm font-semibold text-slate-100">Risk summary</h2>
						<p class="mt-1 text-xs text-slate-500">Recurring risks from accessible reports</p>
					</div>
				</div>
				{#if insights.riskFactors.length === 0}
					<EmptyState
						class="mt-4"
						description="Risk factors will appear when reports flag them."
						title="No risk factors"
					/>
				{:else}
					<ul class="mt-5 space-y-3">
						{#each insights.riskFactors as risk (risk)}
							<li
								class="rounded-md border border-border/70 bg-ink-950/35 p-3 text-sm text-slate-300"
							>
								{risk}
							</li>
						{/each}
					</ul>
				{/if}
			</Card>
		</div>
	{/if}
</div>
