<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import { formatPercent } from '$lib/utils/format';

	let { value, label }: { value: number; label: string } = $props();

	const size = 126;
	const center = size / 2;
	const radius = 47;
	const circumference = 2 * Math.PI * radius;
	const normalizedValue = $derived(Math.max(0, Math.min(value, 100)));
	const progressArc = $derived((normalizedValue / 100) * circumference);
</script>

<Card class="p-5">
	<h2 class="text-sm font-semibold text-slate-100">Success Probability</h2>
	<div class="mt-5 flex items-center gap-5">
		<figure
			aria-labelledby="report-success-title report-success-description"
			class="grid h-25 w-25 shrink-0 place-items-center"
			role="img"
		>
			<svg class="h-25 w-25" viewBox={`0 0 ${size} ${size}`}>
				<title id="report-success-title">Report success probability gauge</title>
				<desc id="report-success-description">
					Report score is {formatPercent(normalizedValue)} and labeled {label}.
				</desc>
				<circle cx={center} cy={center} fill="none" r={radius} stroke="#26314a" stroke-width="14" />
				<circle
					cx={center}
					cy={center}
					fill="none"
					r={radius}
					stroke="#65d88c"
					stroke-dasharray={`${progressArc} ${circumference - progressArc}`}
					stroke-linecap="round"
					stroke-width="14"
					transform={`rotate(-90 ${center} ${center})`}
				/>
				<circle cx={center} cy={center} fill="#101827" r="34" stroke="#1f2a44" />
				<text
					fill="#f8fafc"
					font-size="22"
					font-weight="800"
					text-anchor="middle"
					x={center}
					y={center + 8}
				>
					{formatPercent(normalizedValue)}
				</text>
			</svg>
			<figcaption class="sr-only">{formatPercent(normalizedValue)} success probability.</figcaption>
		</figure>
		<div class="min-w-0">
			<p class="max-w-32 text-xs leading-5 font-medium text-slate-300">{label}</p>
			<div class="mt-3 h-2 rounded-full bg-ink-950" aria-hidden="true">
				<div class="h-2 rounded-full bg-success" style={`width: ${normalizedValue}%`}></div>
			</div>
		</div>
	</div>
</Card>
