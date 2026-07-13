<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Sparkles } from 'lucide-svelte';

	let {
		aside,
		children
	}: {
		aside?: Snippet;
		children: Snippet;
	} = $props();
</script>

<div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
	<div class="min-w-0 space-y-5">
		<section class="rounded-lg border border-border/90 bg-ink-900/72 p-5">
			<div class="flex gap-4">
				<div
					class="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-brand/35 bg-brand/15 text-purple-200"
				>
					<Sparkles aria-hidden="true" size={21} strokeWidth={1.8} />
				</div>
				<div>
					<p class="text-xs font-semibold uppercase tracking-[0.08em] text-purple-200">
						Simulation request assistant
					</p>
					<p class="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
						Answer one focused question at a time. The assistant will turn your answers into a
						structured request that can be reviewed inside Payload CMS.
					</p>
				</div>
			</div>
		</section>
		{@render children()}
	</div>

	{#if aside}
		<aside class="min-w-0 xl:sticky xl:top-24 xl:self-start">
			{@render aside()}
		</aside>
	{/if}
</div>
