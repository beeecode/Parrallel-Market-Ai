<script lang="ts">
	import { AlertTriangle, CircleCheck, Info } from 'lucide-svelte';

	import type { ActivityEvent } from '$lib/types/simulation';

	let { activity }: { activity: ActivityEvent[] } = $props();
</script>

<div class="grid gap-4 p-5 lg:grid-cols-3">
	{#each activity as event (event.id)}
		<article class="rounded-lg border border-border bg-ink-900/38 p-5">
			<div class="flex items-center justify-between gap-4">
				<span
					class={[
						'grid h-9 w-9 place-items-center rounded-md',
						event.tone === 'success'
							? 'bg-success/10 text-green-300'
							: event.tone === 'warning'
								? 'bg-warning/10 text-yellow-200'
								: 'bg-slate-500/10 text-slate-300'
					]}
				>
					{#if event.tone === 'success'}
						<CircleCheck aria-hidden="true" size={18} />
					{:else if event.tone === 'warning'}
						<AlertTriangle aria-hidden="true" size={18} />
					{:else}
						<Info aria-hidden="true" size={18} />
					{/if}
				</span>
				<time class="text-[10px] text-slate-500">{event.timestamp}</time>
			</div>
			<h2 class="mt-4 text-sm font-semibold text-slate-100">{event.title}</h2>
			<p class="mt-2 text-xs leading-5 text-slate-400">{event.description}</p>
		</article>
	{/each}
</div>
