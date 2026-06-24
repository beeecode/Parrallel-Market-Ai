<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import type { Metric } from '$lib/types/dashboard';

	let { metric }: { metric: Metric } = $props();
</script>

<Card class="min-h-28 p-4" interactive>
	<div class="flex items-start justify-between gap-3">
		<p class="text-xs leading-5 font-medium text-slate-400">{metric.label}</p>
		<img
			alt={metric.iconAlt}
			class="h-9 w-9 object-contain opacity-80"
			height="36"
			src={metric.iconSrc}
			width="36"
		/>
	</div>
	<p
		class={[
			'mt-3 text-2xl font-bold tracking-normal',
			metric.tone === 'success'
				? 'text-success'
				: metric.tone === 'primary'
					? 'text-brand-light'
					: 'text-slate-50'
		]}
	>
		{metric.value}
	</p>
</Card>
