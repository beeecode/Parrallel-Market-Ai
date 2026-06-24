<script lang="ts">
	import { Workflow } from 'lucide-svelte';

	import Badge from '$lib/components/ui/Badge.svelte';

	let {
		title,
		status,
		elapsedTime
	}: {
		title: string;
		status: 'Running' | 'Paused' | 'Completed';
		elapsedTime: string;
	} = $props();
</script>

<header
	class="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
>
	<div class="flex min-w-0 items-center gap-3">
		<span
			class="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-brand-light/30 bg-brand/12 text-brand-light"
		>
			<Workflow aria-hidden="true" size={19} strokeWidth={1.8} />
		</span>
		<h1 class="truncate text-sm font-semibold text-slate-100">{title}</h1>
		<Badge tone="success">{status}</Badge>
	</div>
	<p class="text-xs text-slate-400">
		Time Elapsed: <span class="font-medium text-slate-200">{elapsedTime}</span>
	</p>
</header>
