<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import { buildLinePath } from '$lib/utils/format';

	let {
		forecast,
		subtitle,
		trend
	}: {
		forecast: string;
		subtitle: string;
		trend: number[];
	} = $props();

	const width = 360;
	const height = 138;
	const linePath = $derived(buildLinePath(trend, width, height));
	const areaPath = $derived(linePath ? `${linePath} L ${width} ${height} L 0 ${height} Z` : '');
</script>

<Card class="min-h-64 overflow-hidden p-5">
	<div class="flex items-start justify-between gap-4">
		<div>
			<h2 class="text-sm font-semibold text-slate-100">Revenue Forecast</h2>
			<p class="mt-7 text-3xl font-bold tracking-normal text-brand-light">{forecast}</p>
			<p class="mt-2 text-sm text-slate-400">{subtitle}</p>
		</div>
		<img
			alt=""
			aria-hidden="true"
			class="mt-1 h-11 w-11 object-contain opacity-70"
			height="44"
			src="/assets/3d/illustrations/chart-increasing.png"
			width="44"
		/>
	</div>

	<div class="mt-3 h-24 overflow-hidden">
		<svg
			aria-label="Revenue forecast trend increasing across the simulated period"
			class="h-full w-full"
			preserveAspectRatio="none"
			role="img"
			viewBox={`0 0 ${width} ${height}`}
		>
			<defs>
				<linearGradient id="revenue-area" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0%" stop-color="#7c3aed" stop-opacity="0.35" />
					<stop offset="100%" stop-color="#7c3aed" stop-opacity="0" />
				</linearGradient>
			</defs>
			<path d={areaPath} fill="url(#revenue-area)" />
			<path
				d={linePath}
				fill="none"
				stroke="#a855f7"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="3"
			/>
		</svg>
	</div>
</Card>
