<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';

	let {
		optimalPriceRange,
		currentAveragePrice
	}: {
		optimalPriceRange: string;
		currentAveragePrice: string;
	} = $props();
</script>

<Card class="overflow-hidden p-5">
	<h2 class="text-sm font-semibold text-slate-100">Pricing Intelligence</h2>
	<div class="mt-4 grid gap-6 lg:grid-cols-[17rem_1fr] lg:items-end">
		<div>
			<p class="text-xs text-slate-300">Optimal Price Range</p>
			<p class="mt-2 text-xl font-bold text-success">{optimalPriceRange}</p>
			<p class="mt-2 text-xs text-slate-500">Current Avg. Price: {currentAveragePrice}</p>
		</div>

		<div class="relative h-32 overflow-hidden">
			<svg
				aria-label="Demand curve peaks inside the optimal price range"
				class="h-full w-full"
				preserveAspectRatio="none"
				role="img"
				viewBox="0 0 520 160"
			>
				<defs>
					<linearGradient id="demand-area" x1="0" x2="0" y1="0" y2="1">
						<stop offset="0%" stop-color="#22c55e" stop-opacity="0.22" />
						<stop offset="100%" stop-color="#22c55e" stop-opacity="0" />
					</linearGradient>
				</defs>
				<path
					d="M18 136 C 110 132, 145 102, 200 76 C 252 52, 282 54, 334 85 C 385 116, 433 132, 502 137 L 502 160 L 18 160 Z"
					fill="url(#demand-area)"
				/>
				<path
					d="M18 136 C 110 132, 145 102, 200 76 C 252 52, 282 54, 334 85 C 385 116, 433 132, 502 137"
					fill="none"
					stroke="#86efac"
					stroke-linecap="round"
					stroke-width="2.5"
				/>
				<path d="M262 46V145" stroke="#86efac" stroke-dasharray="4 4" stroke-opacity="0.45" />
			</svg>
			<p class="absolute top-7 right-4 max-w-32 text-xs leading-5 font-medium text-green-300">
				Demand is highest in this range
			</p>
		</div>
	</div>
</Card>
