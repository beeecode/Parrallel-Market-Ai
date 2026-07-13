<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { formatPercent } from '$lib/utils/format';

	let { value, description }: { value: number; description: string } = $props();

	const size = 148;
	const center = size / 2;
	const radius = 58;
	const circumference = 2 * Math.PI * radius;
	const normalizedValue = $derived(Math.max(0, Math.min(value, 100)));
	const successArc = $derived((normalizedValue / 100) * circumference);
	const opportunityArc = $derived((Math.min(14, 100 - normalizedValue) / 100) * circumference);
</script>

<Card class="min-h-64 p-5">
	<div class="flex items-start justify-between gap-4">
		<h2 class="text-sm font-semibold text-slate-100">Success Probability</h2>
		<img
			alt=""
			aria-hidden="true"
			class="h-11 w-11 object-contain opacity-70"
			height="44"
			src="/assets/3d/illustrations/bullseye.png"
			width="44"
		/>
	</div>

	<div class="mt-5 grid gap-5 sm:grid-cols-[8rem_1fr] sm:items-center">
		<figure
			aria-labelledby="dashboard-success-title dashboard-success-description"
			class="grid h-32 w-32 place-items-center"
			role="img"
		>
			<svg class="h-32 w-32" viewBox={`0 0 ${size} ${size}`}>
				<title id="dashboard-success-title">Success probability gauge</title>
				<desc id="dashboard-success-description">
					The simulation has a {formatPercent(normalizedValue)} success probability with a small improvement
					opportunity segment and remaining market risk.
				</desc>
				<circle cx={center} cy={center} fill="none" r={radius} stroke="#26314a" stroke-width="16" />
				<circle
					cx={center}
					cy={center}
					fill="none"
					r={radius}
					stroke="#22c55e"
					stroke-dasharray={`${opportunityArc} ${circumference - opportunityArc}`}
					stroke-dashoffset={-successArc}
					stroke-linecap="round"
					stroke-width="16"
					transform={`rotate(-90 ${center} ${center})`}
				/>
				<circle
					cx={center}
					cy={center}
					fill="none"
					r={radius}
					stroke="#8b5cf6"
					stroke-dasharray={`${successArc} ${circumference - successArc}`}
					stroke-linecap="round"
					stroke-width="16"
					transform={`rotate(-90 ${center} ${center})`}
				/>
				<circle cx={center} cy={center} fill="#101827" r="43" stroke="#1f2a44" />
				<text
					fill="#f8fafc"
					font-size="28"
					font-weight="800"
					text-anchor="middle"
					x={center}
					y={center + 9}
				>
					{formatPercent(normalizedValue)}
				</text>
			</svg>
			<figcaption class="sr-only">
				{formatPercent(normalizedValue)} success probability, {formatPercent(
					Math.round(100 - normalizedValue)
				)}
				remaining risk.
			</figcaption>
		</figure>

		<div class="space-y-4">
			<p class="max-w-xs text-sm leading-6 text-slate-300">{description}</p>
			<div class="grid grid-cols-3 gap-2 text-[0.68rem] text-slate-400">
				<span class="flex items-center gap-1.5">
					<span class="h-2 w-2 rounded-full bg-brand-light"></span>
					Likely
				</span>
				<span class="flex items-center gap-1.5">
					<span class="h-2 w-2 rounded-full bg-success"></span>
					Upside
				</span>
				<span class="flex items-center gap-1.5">
					<span class="h-2 w-2 rounded-full bg-slate-600"></span>
					Risk
				</span>
			</div>
			<Button size="sm" onclick={() => goto(resolve('/reports'))}>View Full Report</Button>
		</div>
	</div>
</Card>
