<script lang="ts">
	import { Bot } from 'lucide-svelte';

	let {
		helper,
		title,
		message
	}: {
		helper?: string;
		message: string;
		title: string;
	} = $props();
</script>

<div class="flex gap-3">
	<div
		class="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-brand/35 bg-brand/15 text-purple-200"
	>
		<Bot aria-hidden="true" size={19} strokeWidth={1.8} />
	</div>
	<div
		class="min-w-0 rounded-lg rounded-tl-sm border border-border/80 bg-ink-900/72 px-4 py-3 shadow-[0_10px_20px_rgba(0,0,0,0.08)]"
	>
		<p class="text-xs font-semibold text-purple-200">{title}</p>
		<p class="mt-2 text-sm leading-6 text-slate-100">{message}</p>
		{#if helper}
			<p class="mt-2 text-xs leading-5 text-slate-400">{helper}</p>
		{/if}
	</div>
</div>
