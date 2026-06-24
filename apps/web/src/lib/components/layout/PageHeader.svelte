<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		subtitle,
		actions
	}: {
		title: string;
		subtitle?: string;
		actions?: Snippet;
	} = $props();
</script>

<header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
	<div>
		<h1 class="text-2xl leading-tight font-bold tracking-normal text-slate-50 sm:text-3xl">
			{title}
		</h1>
		{#if subtitle}
			<p class="mt-2 text-sm text-slate-400">{subtitle}</p>
		{/if}
	</div>
	{#if actions}
		<div class="flex shrink-0 items-center gap-3">
			{@render actions()}
		</div>
	{/if}
</header>
