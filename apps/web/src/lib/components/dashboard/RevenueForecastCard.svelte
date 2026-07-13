<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';

	let {
		forecast,
		subtitle,
		trend
	}: {
		forecast: string;
		subtitle: string;
		trend: number[];
	} = $props();

	const width = 640;
	const height = 260;
	const chart = {
		bottom: 38,
		left: 54,
		right: 22,
		top: 24
	};
	const plotWidth = width - chart.left - chart.right;
	const plotHeight = height - chart.top - chart.bottom;

	function forecastRange(
		value: string
	): { maximum: number; minimum: number; prefix: string } | null {
		const matches = [...value.matchAll(/([^0-9\s-]*)\s*([0-9]+(?:\.[0-9]+)?)\s*M/gi)];
		if (matches.length < 2) return null;

		return {
			maximum: Number(matches[1][2]),
			minimum: Number(matches[0][2]),
			prefix: matches[0][1] || ''
		};
	}

	const range = $derived(forecastRange(forecast));
	const rawMinimum = $derived(trend.length ? Math.min(...trend) : 0);
	const rawMaximum = $derived(trend.length ? Math.max(...trend) : 1);
	const rawRange = $derived(Math.max(rawMaximum - rawMinimum, 1));
	const revenueValues = $derived(
		trend.map((value) => {
			if (!range) return value;
			const progress = (value - rawMinimum) / rawRange;
			return range.minimum + progress * (range.maximum - range.minimum);
		})
	);
	const minimum = $derived(revenueValues.length ? Math.min(...revenueValues) : 0);
	const maximum = $derived(revenueValues.length ? Math.max(...revenueValues) : 1);
	const valueRange = $derived(Math.max(maximum - minimum, 1));
	const yAxisTicks = $derived(
		Array.from({ length: 4 }, (_, index) => maximum - (valueRange / 3) * index)
	);
	const points = $derived(
		revenueValues.map((value, index) => {
			const x =
				chart.left + (trend.length > 1 ? (index / (trend.length - 1)) * plotWidth : plotWidth / 2);
			const y = chart.top + (1 - (value - minimum) / valueRange) * plotHeight;

			return {
				label: `Period ${index + 1}`,
				value,
				x,
				y
			};
		})
	);
	const linePath = $derived(
		points
			.map(
				(point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`
			)
			.join(' ')
	);
	const areaPath = $derived(
		linePath
			? `${linePath} L ${chart.left + plotWidth} ${chart.top + plotHeight} L ${chart.left} ${
					chart.top + plotHeight
				} Z`
			: ''
	);
	const peak = $derived(
		points.reduce((best, point) => (point.value > best.value ? point : best), points[0])
	);

	function formatRevenue(value: number): string {
		if (!range) return Math.round(value).toLocaleString('en-NG');
		return `${range.prefix}${value.toFixed(1)}M`;
	}
</script>

<Card class="min-h-80 overflow-hidden p-5">
	<div class="flex items-start justify-between gap-4">
		<div>
			<h2 class="text-sm font-semibold text-slate-100">Revenue Forecast</h2>
			<p class="mt-7 text-3xl font-bold tracking-normal text-brand-light">{forecast}</p>
			<p class="mt-2 text-sm text-slate-400">{subtitle}</p>
		</div>
		<div
			class="rounded-md border border-brand/25 bg-brand/10 px-3 py-2 text-right shadow-[0_0_18px_rgba(124,58,237,0.12)]"
		>
			<p class="text-[0.68rem] font-semibold text-slate-400">Peak</p>
			<p class="mt-1 text-sm font-bold text-purple-200">
				{peak ? formatRevenue(peak.value) : forecast}
			</p>
		</div>
	</div>

	<div class="mt-5 rounded-lg border border-border/70 bg-ink-950/35 p-3">
		<svg
			aria-labelledby="revenue-chart-title revenue-chart-description"
			class="h-44 w-full sm:h-52"
			preserveAspectRatio="xMidYMid meet"
			role="img"
			viewBox={`0 0 ${width} ${height}`}
		>
			<title id="revenue-chart-title">Revenue forecast chart</title>
			<desc id="revenue-chart-description">
				Line chart showing expected monthly revenue from {formatRevenue(minimum)} to
				{formatRevenue(maximum)} across {trend.length} forecast periods.
			</desc>
			<defs>
				<linearGradient id="revenue-area" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0%" stop-color="#a855f7" stop-opacity="0.34" />
					<stop offset="100%" stop-color="#7c3aed" stop-opacity="0" />
				</linearGradient>
				<filter id="revenue-glow" x="-10%" y="-30%" width="120%" height="160%">
					<feGaussianBlur stdDeviation="3" />
				</filter>
			</defs>

			{#each yAxisTicks as tick (tick)}
				{@const y = chart.top + (1 - (tick - minimum) / valueRange) * plotHeight}
				<line
					stroke="#1f2a44"
					stroke-dasharray="4 8"
					stroke-width="1"
					x1={chart.left}
					x2={chart.left + plotWidth}
					y1={y}
					y2={y}
				/>
				<text
					fill="#94a3b8"
					font-size="15"
					font-weight="600"
					text-anchor="end"
					x={chart.left - 12}
					y={y + 5}
				>
					{formatRevenue(tick)}
				</text>
			{/each}

			<line
				stroke="#334155"
				stroke-width="1.2"
				x1={chart.left}
				x2={chart.left}
				y1={chart.top}
				y2={chart.top + plotHeight}
			/>
			<line
				stroke="#334155"
				stroke-width="1.2"
				x1={chart.left}
				x2={chart.left + plotWidth}
				y1={chart.top + plotHeight}
				y2={chart.top + plotHeight}
			/>

			<path d={areaPath} fill="url(#revenue-area)" />
			<path
				d={linePath}
				fill="none"
				filter="url(#revenue-glow)"
				opacity="0.55"
				stroke="#a855f7"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="7"
			/>
			<path
				d={linePath}
				fill="none"
				stroke="#a855f7"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="4"
				vector-effect="non-scaling-stroke"
			/>

			{#each points as point, index (point.label)}
				<g>
					<title>{point.label}: {formatRevenue(point.value)}</title>
					<circle
						cx={point.x}
						cy={point.y}
						fill="#070b16"
						r={index === points.length - 1 ? 7 : 5}
						stroke={index === points.length - 1 ? '#22c55e' : '#c084fc'}
						stroke-width="3"
					/>
				</g>
			{/each}

			{#if points[0]}
				<text
					fill="#94a3b8"
					font-size="15"
					font-weight="600"
					text-anchor="middle"
					x={points[0].x}
					y="247"
				>
					Start
				</text>
			{/if}
			{#if points[Math.floor(points.length / 2)]}
				{@const middle = points[Math.floor(points.length / 2)]}
				<text
					fill="#94a3b8"
					font-size="15"
					font-weight="600"
					text-anchor="middle"
					x={middle.x}
					y="247"
				>
					Mid
				</text>
			{/if}
			{#if points[points.length - 1]}
				{@const last = points[points.length - 1]}
				<text fill="#94a3b8" font-size="15" font-weight="600" text-anchor="end" x={last.x} y="247">
					Forecast
				</text>
				<text
					fill="#bbf7d0"
					font-size="16"
					font-weight="700"
					text-anchor="end"
					x={Math.min(last.x, width - 10)}
					y={Math.max(last.y - 15, 18)}
				>
					{formatRevenue(last.value)}
				</text>
			{/if}
		</svg>
	</div>

	<div class="sr-only">
		<table>
			<caption>Revenue forecast data points</caption>
			<thead>
				<tr>
					<th scope="col">Period</th>
					<th scope="col">Revenue</th>
				</tr>
			</thead>
			<tbody>
				{#each points as point (point.label)}
					<tr>
						<th scope="row">{point.label}</th>
						<td>{formatRevenue(point.value)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</Card>
