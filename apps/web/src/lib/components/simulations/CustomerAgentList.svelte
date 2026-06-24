<script lang="ts">
	import type { CustomerAgent } from '$lib/types/simulation';

	let {
		agents,
		activeAgentId,
		onselect
	}: {
		agents: CustomerAgent[];
		activeAgentId?: string;
		onselect?: (id: string) => void;
	} = $props();
</script>

<aside
	class="min-w-0 max-w-full overflow-hidden border-b border-border/80 bg-ink-900/38 md:border-r md:border-b-0"
>
	<div class="flex w-full max-w-full overflow-x-auto md:block md:max-h-[35rem] md:overflow-y-auto">
		{#each agents as agent (agent.id)}
			<button
				aria-pressed={activeAgentId === agent.id}
				class={[
					'flex min-w-[15rem] gap-3 border-r border-border/65 px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-light md:min-w-0 md:w-full md:border-r-0 md:border-b',
					activeAgentId === agent.id ? 'bg-white/[0.05]' : 'hover:bg-white/[0.028]'
				]}
				onclick={() => onselect?.(agent.id)}
				type="button"
			>
				<span
					class="grid h-9 w-9 shrink-0 place-items-center rounded-full border bg-ink-800"
					style={`border-color: ${agent.accent}88`}
				>
					<img
						alt={agent.avatarAlt}
						class="h-8 w-8 rounded-full object-cover"
						height="32"
						src={agent.avatarSrc}
						width="32"
					/>
				</span>
				<span class="min-w-0 flex-1">
					<span class="flex items-center justify-between gap-3">
						<span class="truncate text-xs font-semibold text-slate-100">
							{agent.name} <span class="text-slate-500">(Age {agent.age})</span>
						</span>
						<span class="shrink-0 text-[10px] text-slate-500">{agent.lastSeen}</span>
					</span>
					<span class="mt-1 block truncate text-[11px] text-slate-400">{agent.preview}</span>
				</span>
			</button>
		{/each}
	</div>
</aside>
