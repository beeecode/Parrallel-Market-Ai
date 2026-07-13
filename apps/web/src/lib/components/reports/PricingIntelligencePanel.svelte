<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';

	let {
		optimalPriceRange,
		currentAveragePrice,
		revenueForecast
	}: {
		optimalPriceRange: string;
		currentAveragePrice: string;
		revenueForecast: string;
	} = $props();

	type ParsedRange = {
		maximum: number;
		minimum: number;
		prefix: string;
	};

	type ParsedPrice = {
		amount: number;
		prefix: string;
	};

	type ChartPoint = {
		demand: number;
		label: string;
		price: number;
		x: number;
		y: number;
	};

	const width = 640;
	const height = 260;
	const chart = {
		bottom: 42,
		left: 48,
		right: 28,
		top: 30
	};
	const plotWidth = width - chart.left - chart.right;
	const plotHeight = height - chart.top - chart.bottom;

	const parsedRange = $derived(parsePriceRange(optimalPriceRange));
	const parsedCurrent = $derived(parsePrice(currentAveragePrice));
	const model = $derived(buildDemandModel(parsedRange, parsedCurrent));

	function parseNumbers(value: string): number[] {
		return [...value.matchAll(/[0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?/g)].map(
			(match) => Number(match[0].replaceAll(',', ''))
		);
	}

	function parsePrefix(value: string): string {
		return value.match(/[^\d\s,.-]+/)?.[0] ?? '\u20a6';
	}

	function parsePriceRange(value: string): ParsedRange {
		const [minimum = 3200, maximum = 3800] = parseNumbers(value);

		return {
			maximum,
			minimum,
			prefix: parsePrefix(value)
		};
	}

	function parsePrice(value: string): ParsedPrice {
		const [amount = 4200] = parseNumbers(value);

		return {
			amount,
			prefix: parsePrefix(value)
		};
	}

	function formatPrice(value: number, prefix: string): string {
		return `${prefix}${Math.round(value).toLocaleString('en-NG')}`;
	}

	function scaleX(price: number, minimum: number, range: number): number {
		return chart.left + ((price - minimum) / range) * plotWidth;
	}

	function scaleY(demand: number): number {
		return chart.top + (1 - demand / 100) * plotHeight;
	}

	function demandAtPrice(
		price: number,
		optimalCenter: number,
		spread: number,
		maximum: number
	): number {
		const distancePenalty = Math.pow((price - optimalCenter) / spread, 2) * 74;
		const premiumPenalty = price > maximum ? ((price - maximum) / spread) * 20 : 0;

		return Math.max(18, Math.min(100, 100 - distancePenalty - premiumPenalty));
	}

	function buildCurvePath(points: ChartPoint[]): string {
		if (!points.length) return '';

		return points.reduce((path, point, index) => {
			if (index === 0) return `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;

			const previous = points[index - 1];
			const controlX = (previous.x + point.x) / 2;

			return `${path} C ${controlX.toFixed(1)} ${previous.y.toFixed(1)}, ${controlX.toFixed(
				1
			)} ${point.y.toFixed(1)}, ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
		}, '');
	}

	function buildDemandModel(range: ParsedRange, current: ParsedPrice) {
		const currencyPrefix = range.prefix || current.prefix || '\u20a6';
		const optimalCenter = (range.minimum + range.maximum) / 2;
		const optimalWidth = Math.max(range.maximum - range.minimum, 1);
		const domainMinimum = Math.max(
			0,
			Math.min(range.minimum - optimalWidth * 1.4, current.amount - 1300)
		);
		const domainMaximum = Math.max(range.maximum + optimalWidth * 1.6, current.amount + 650);
		const domainRange = Math.max(domainMaximum - domainMinimum, 1);
		const spread = Math.max(optimalWidth * 1.8, 900);
		const priceCandidates = [
			domainMinimum,
			range.minimum - optimalWidth * 0.55,
			range.minimum,
			optimalCenter,
			range.maximum,
			current.amount,
			domainMaximum
		];
		const prices = Array.from(
			new Set(
				priceCandidates
					.map((price) => Math.round(price))
					.filter((price) => price >= domainMinimum && price <= domainMaximum)
			)
		).sort((left, right) => left - right);
		const points = prices.map((price) => {
			const demand = demandAtPrice(price, optimalCenter, spread, range.maximum);

			return {
				demand,
				label: formatPrice(price, currencyPrefix),
				price,
				x: scaleX(price, domainMinimum, domainRange),
				y: scaleY(demand)
			};
		});
		const linePath = buildCurvePath(points);
		const baseline = chart.top + plotHeight;
		const areaPath = linePath
			? `${linePath} L ${chart.left + plotWidth} ${baseline} L ${chart.left} ${baseline} Z`
			: '';
		const optimalStartX = scaleX(range.minimum, domainMinimum, domainRange);
		const optimalCenterX = scaleX(optimalCenter, domainMinimum, domainRange);
		const optimalEndX = scaleX(range.maximum, domainMinimum, domainRange);
		const currentX = scaleX(current.amount, domainMinimum, domainRange);
		const currentDemand = demandAtPrice(current.amount, optimalCenter, spread, range.maximum);
		const currentY = scaleY(currentDemand);
		const currentLabelAnchor =
			currentX > width - 135 ? 'end' : currentX < chart.left + 135 ? 'start' : 'middle';
		const currentLabelX = Math.min(width - 20, Math.max(chart.left + 20, currentX));
		const ticks = [
			domainMinimum,
			range.minimum,
			optimalCenter,
			range.maximum,
			Math.min(domainMaximum, Math.max(current.amount, range.maximum)),
			domainMaximum
		];

		return {
			areaPath,
			currentDemand,
			currentLabelAnchor,
			currentLabelX,
			currentX,
			currentY,
			currencyPrefix,
			domainMaximum,
			domainMinimum,
			linePath,
			optimalCenter,
			optimalCenterX,
			optimalEndX,
			optimalStartX,
			points,
			ticks: Array.from(new Set(ticks.map((tick) => Math.round(tick)))).sort(
				(left, right) => left - right
			)
		};
	}
</script>

<Card class="overflow-hidden p-5">
	<h2 class="text-sm font-semibold text-slate-100">Pricing Intelligence</h2>
	<div class="mt-4 grid gap-6 lg:grid-cols-[17rem_1fr] lg:items-center">
		<div>
			<p class="text-xs text-slate-300">Optimal Price Range</p>
			<p class="mt-2 text-xl font-bold text-success">{optimalPriceRange}</p>
			<p class="mt-2 text-xs text-slate-500">Current Avg. Price: {currentAveragePrice}</p>
			<p class="mt-1 text-xs text-slate-500">Revenue Forecast: {revenueForecast}</p>
			<div class="mt-4 grid gap-2 text-[0.68rem] text-slate-400">
				<span class="flex items-center gap-2">
					<span class="h-2 w-5 rounded-full bg-success/50"></span>
					Optimal demand range
				</span>
				<span class="flex items-center gap-2">
					<span class="h-2 w-5 rounded-full bg-amber-300/70"></span>
					Current average price
				</span>
			</div>
		</div>

		<div class="rounded-lg border border-border/70 bg-ink-950/35 p-3">
			<svg
				aria-labelledby="pricing-chart-title pricing-chart-description"
				class="h-52 w-full sm:h-56"
				preserveAspectRatio="xMidYMid meet"
				role="img"
				viewBox={`0 0 ${width} ${height}`}
			>
				<title id="pricing-chart-title">Pricing demand curve</title>
				<desc id="pricing-chart-description">
					Demand curve showing the optimal price range from {optimalPriceRange}. Current average
					price is {currentAveragePrice} with estimated demand at {Math.round(model.currentDemand)}
					percent.
				</desc>
				<defs>
					<linearGradient id="pricing-demand-area" x1="0" x2="0" y1="0" y2="1">
						<stop offset="0%" stop-color="#22c55e" stop-opacity="0.22" />
						<stop offset="100%" stop-color="#22c55e" stop-opacity="0" />
					</linearGradient>
					<filter id="pricing-demand-glow" x="-10%" y="-30%" width="120%" height="160%">
						<feGaussianBlur stdDeviation="2.5" />
					</filter>
				</defs>

				{#each [100, 75, 50, 25] as tick (tick)}
					{@const y = scaleY(tick)}
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
						font-size="13"
						font-weight="600"
						text-anchor="end"
						x={chart.left - 10}
						y={y + 4}
					>
						{tick}%
					</text>
				{/each}

				<rect
					fill="#22c55e"
					fill-opacity="0.1"
					height={plotHeight}
					rx="10"
					x={model.optimalStartX}
					y={chart.top}
					width={Math.max(model.optimalEndX - model.optimalStartX, 8)}
				/>
				<line
					stroke="#22c55e"
					stroke-dasharray="5 7"
					stroke-opacity="0.55"
					stroke-width="1.4"
					x1={model.optimalStartX}
					x2={model.optimalStartX}
					y1={chart.top}
					y2={chart.top + plotHeight}
				/>
				<line
					stroke="#22c55e"
					stroke-dasharray="5 7"
					stroke-opacity="0.55"
					stroke-width="1.4"
					x1={model.optimalEndX}
					x2={model.optimalEndX}
					y1={chart.top}
					y2={chart.top + plotHeight}
				/>

				<path d={model.areaPath} fill="url(#pricing-demand-area)" />
				<path
					d={model.linePath}
					fill="none"
					filter="url(#pricing-demand-glow)"
					opacity="0.6"
					stroke="#86efac"
					stroke-linecap="round"
					stroke-width="6"
				/>
				<path
					d={model.linePath}
					fill="none"
					stroke="#86efac"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="3"
					vector-effect="non-scaling-stroke"
				/>

				<line
					stroke="#facc15"
					stroke-dasharray="5 5"
					stroke-width="2"
					x1={model.currentX}
					x2={model.currentX}
					y1={chart.top}
					y2={chart.top + plotHeight}
				/>
				<circle
					cx={model.currentX}
					cy={model.currentY}
					fill="#070b16"
					r="6"
					stroke="#facc15"
					stroke-width="3"
				/>

				{#each model.points as point (point.label)}
					<circle cx={point.x} cy={point.y} fill="#22c55e" opacity="0.55" r="3">
						<title>{point.label}: {Math.round(point.demand)}% estimated demand</title>
					</circle>
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

				<text
					fill="#bbf7d0"
					font-size="14"
					font-weight="700"
					text-anchor="middle"
					x={model.optimalCenterX}
					y="22"
				>
					Optimal range
				</text>
				<text
					fill="#fde68a"
					font-size="13"
					font-weight="700"
					text-anchor={model.currentLabelAnchor}
					x={model.currentLabelX}
					y={Math.max(model.currentY - 14, 18)}
				>
					Current avg
				</text>

				{#each model.ticks as tick (tick)}
					{@const x = scaleX(tick, model.domainMinimum, model.domainMaximum - model.domainMinimum)}
					<text fill="#94a3b8" font-size="13" font-weight="600" text-anchor="middle" {x} y="249">
						{formatPrice(tick, model.currencyPrefix)}
					</text>
				{/each}
			</svg>
		</div>
	</div>

	<div class="sr-only">
		<table>
			<caption>Pricing demand chart data</caption>
			<thead>
				<tr>
					<th scope="col">Price</th>
					<th scope="col">Estimated demand</th>
				</tr>
			</thead>
			<tbody>
				{#each model.points as point (point.label)}
					<tr>
						<th scope="row">{point.label}</th>
						<td>{Math.round(point.demand)}%</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</Card>
