<script lang="ts">
	import { trustMetrics } from '$lib/features/landing/landing.constants';
</script>

<section aria-labelledby="demo-metrics-title" class="border-b border-border/55 bg-ink-925/72">
	<div class="mx-auto max-w-[88rem] px-4 py-10 sm:px-6 lg:px-8">
		<p
			id="demo-metrics-title"
			class="mb-6 text-center text-xs font-semibold text-slate-500 uppercase"
		>
			Sample simulation metrics from the demo workspace
		</p>
		<dl
			class="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-4"
		>
			{#each trustMetrics as metric (metric.label)}
				<div class="bg-ink-850 px-4 py-5 text-center sm:px-6">
					<dt class="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">{metric.label}</dt>
					<dd class="text-lg font-bold text-slate-50 sm:text-xl">{metric.value}</dd>
				</div>
			{/each}
		</dl>
	</div>
</section>
