<script lang="ts">
	import type { CustomerAgent, SimulationStat } from '$lib/types/simulation';

	let { stats, agents = [] }: { stats: SimulationStat[]; agents?: CustomerAgent[] } = $props();
</script>

<div class="p-5">
	<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
		{#each stats as stat (stat.label)}
			<article class="rounded-lg border border-border bg-ink-900/38 p-5">
				<p class="text-xs font-medium text-slate-400">{stat.label}</p>
				<p class="mt-3 text-2xl font-bold text-brand-light">{stat.value}</p>
				<p class="mt-2 text-xs leading-5 text-slate-500">{stat.detail}</p>
			</article>
		{/each}
	</div>

	{#if agents.length > 0}
		<div class="mt-5 rounded-lg border border-border bg-ink-900/30 p-5">
			<h2 class="text-sm font-semibold text-slate-100">Customer agents in this simulation</h2>
			<div class="mt-4 flex flex-wrap gap-3">
				{#each agents as agent (agent.id)}
					<div
						class="flex items-center gap-2 rounded-md border border-border bg-ink-950/45 px-3 py-2"
					>
						<img
							alt={agent.avatarAlt}
							class="h-7 w-7 rounded-full"
							height="28"
							src={agent.avatarSrc}
							width="28"
						/>
						<span class="text-xs text-slate-200">{agent.name}, {agent.age}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
