<script lang="ts">
	import { Download, ExternalLink, FileBarChart } from 'lucide-svelte';
	import { resolve } from '$app/paths';

	import Button from '$lib/components/ui/Button.svelte';

	let {
		title,
		reportText,
		filename,
		reportId
	}: {
		title: string;
		reportText: string;
		filename: string;
		reportId?: string;
	} = $props();

	function downloadReport(): void {
		const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = filename;
		anchor.click();
		URL.revokeObjectURL(url);
	}
</script>

<header
	class="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
>
	<div class="flex min-w-0 items-center gap-3">
		<span
			class="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-brand-light/30 bg-brand/12 text-brand-light"
		>
			<FileBarChart aria-hidden="true" size={19} strokeWidth={1.8} />
		</span>
		<h1 class="truncate text-sm font-semibold text-slate-100">{title}</h1>
	</div>
	<div class="flex flex-wrap items-center gap-2">
		{#if reportId}
			<a
				class="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-border bg-ink-800/70 px-3 text-xs font-semibold text-slate-100 transition hover:border-brand-light/55 hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
				href={resolve('/reports/[id]', { id: reportId })}
			>
				<ExternalLink aria-hidden="true" size={14} />
				View Detail
			</a>
		{/if}
		<Button onclick={downloadReport} size="sm">
			<Download aria-hidden="true" size={15} />
			Download Text Report
		</Button>
	</div>
</header>
