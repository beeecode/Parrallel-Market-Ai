<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import type { SentimentPoint } from '$lib/types/report';

	let { sentiment }: { sentiment: SentimentPoint[] } = $props();

	function buildSentimentGradient(points: SentimentPoint[]): string {
		let start = 0;
		const segments = points.map((point) => {
			const end = start + point.value;
			const segment = `${point.color} ${start}% ${end}%`;
			start = end;
			return segment;
		});

		return `conic-gradient(${segments.join(', ')})`;
	}
</script>

<Card class="p-5">
	<h2 class="text-sm font-semibold text-slate-100">Customer Sentiment</h2>
	<div class="mt-5 grid gap-6 sm:grid-cols-[7rem_1fr] sm:items-center">
		<div
			aria-label="Customer sentiment: 49 percent positive, 28 percent neutral, 23 percent negative"
			class="grid h-26 w-26 place-items-center rounded-full"
			role="img"
			style={`background: ${buildSentimentGradient(sentiment)}`}
		>
			<div class="h-[4.55rem] w-[4.55rem] rounded-full bg-ink-850"></div>
		</div>

		<dl class="space-y-3">
			{#each sentiment as point (point.label)}
				<div class="grid grid-cols-[1fr_auto] items-center gap-4">
					<dt class="flex items-center gap-3 text-xs text-slate-300">
						<span
							aria-hidden="true"
							class="h-2.5 w-2.5 rounded-full"
							style={`background-color: ${point.color}`}
						></span>
						{point.label}
					</dt>
					<dd class="text-xs font-semibold text-slate-100">{point.value}%</dd>
				</div>
			{/each}
		</dl>
	</div>
</Card>
