<script lang="ts">
	let {
		current,
		percent,
		total
	}: {
		current: number;
		percent: number;
		total: number;
	} = $props();
</script>

<div aria-label="Request progress">
	<div class="flex items-center justify-between gap-4">
		<p class="text-xs font-semibold text-slate-300">Step {current} of {total}</p>
		<p class="text-xs font-semibold text-purple-200">{percent}% complete</p>
	</div>
	<div class="mt-3 h-2 overflow-hidden rounded-full bg-ink-950">
		<div
			class="h-full rounded-full bg-gradient-to-r from-brand to-brand-light transition-all duration-300"
			style={`width: ${percent}%`}
		></div>
	</div>
</div>
