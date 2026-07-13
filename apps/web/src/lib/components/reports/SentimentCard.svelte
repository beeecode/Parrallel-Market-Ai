<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import type { SentimentPoint } from '$lib/types/report';

	let { sentiment }: { sentiment: SentimentPoint[] } = $props();

	const size = 132;
	const center = size / 2;
	const radius = 45;
	const strokeWidth = 18;
	const circumference = 2 * Math.PI * radius;
	const total = $derived(sentiment.reduce((sum, point) => sum + point.value, 0) || 1);
	const strongestSentiment = $derived(
		sentiment.reduce<SentimentPoint | null>(
			(strongest, point) => (!strongest || point.value > strongest.value ? point : strongest),
			null
		)
	);
	const segments = $derived(createSegments(sentiment, total));

	function createSegments(points: SentimentPoint[], totalValue: number) {
		let consumed = 0;

		return points.map((point) => {
			const ratio = point.value / totalValue;
			const arcLength = ratio * circumference;
			const dashOffset = -consumed;
			consumed += arcLength;

			return {
				...point,
				arcLength,
				dashOffset,
				percentage: Math.round(ratio * 100)
			};
		});
	}
</script>

<Card class="p-5">
	<h2 class="text-sm font-semibold text-slate-100">Customer Sentiment</h2>
	<div class="mt-5 grid gap-6 sm:grid-cols-[7rem_1fr] sm:items-center">
		<figure
			aria-labelledby="sentiment-chart-title sentiment-chart-description"
			class="grid h-26 w-26 place-items-center"
			role="img"
		>
			<svg class="h-26 w-26" viewBox={`0 0 ${size} ${size}`}>
				<title id="sentiment-chart-title">Customer sentiment donut chart</title>
				<desc id="sentiment-chart-description">
					Customer sentiment distribution across {sentiment.length} categories. The strongest segment
					is {strongestSentiment?.label ?? 'not available'} at
					{strongestSentiment?.value ?? 0} percent.
				</desc>
				<circle
					cx={center}
					cy={center}
					fill="none"
					r={radius}
					stroke="#26314a"
					stroke-width={strokeWidth}
				/>
				{#each segments as segment (segment.label)}
					<circle
						cx={center}
						cy={center}
						fill="none"
						r={radius}
						stroke={segment.color}
						stroke-dasharray={`${Math.max(segment.arcLength - 3, 0)} ${circumference}`}
						stroke-dashoffset={segment.dashOffset}
						stroke-linecap="round"
						stroke-width={strokeWidth}
						transform={`rotate(-90 ${center} ${center})`}
					>
						<title>{segment.label}: {segment.value}%</title>
					</circle>
				{/each}
				<circle cx={center} cy={center} fill="#101827" r="31" stroke="#1f2a44" />
				<text
					fill="#f8fafc"
					font-size="17"
					font-weight="800"
					text-anchor="middle"
					x={center}
					y={center - 2}
				>
					{strongestSentiment?.value ?? 0}%
				</text>
				<text
					fill="#94a3b8"
					font-size="10"
					font-weight="700"
					text-anchor="middle"
					x={center}
					y={center + 14}
				>
					{strongestSentiment?.label ?? 'Sentiment'}
				</text>
			</svg>
			<figcaption class="sr-only">
				{#each sentiment as point, index (point.label)}
					{point.label}: {point.value}%{index === sentiment.length - 1 ? '.' : ','}
				{/each}
			</figcaption>
		</figure>

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

	<div class="sr-only">
		<table>
			<caption>Customer sentiment breakdown</caption>
			<thead>
				<tr>
					<th scope="col">Sentiment</th>
					<th scope="col">Share</th>
				</tr>
			</thead>
			<tbody>
				{#each sentiment as point (point.label)}
					<tr>
						<th scope="row">{point.label}</th>
						<td>{point.value}%</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</Card>
