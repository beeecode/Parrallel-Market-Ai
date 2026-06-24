<script lang="ts">
	let { label = 'Loading data...', class: className = '' }: { label?: string; class?: string } =
		$props();
</script>

<div
	class={[
		'flex min-h-32 items-center justify-center rounded-lg border border-border bg-ink-900/45 p-6 text-sm text-slate-400',
		className
	]}
	role="status"
>
	<span class="mr-3 h-2.5 w-2.5 animate-pulse rounded-full bg-brand-light"></span>
	{label}
</div>
