<script lang="ts">
	import { Download, FileBarChart } from 'lucide-svelte';

	import Button from '$lib/components/ui/Button.svelte';

	let {
		title,
		reportText
	}: {
		title: string;
		reportText: string;
	} = $props();

	function downloadReport(): void {
		const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = 'shawarma-spot-simulation-report.txt';
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
	<Button onclick={downloadReport} size="sm">
		<Download aria-hidden="true" size={15} />
		Download Report
	</Button>
</header>
