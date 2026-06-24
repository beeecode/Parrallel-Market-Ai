<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { formatPercent } from '$lib/utils/format';

	let { value, description }: { value: number; description: string } = $props();
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
		<div
			aria-label={`Success probability ${value}%`}
			class="relative grid h-30 w-30 place-items-center rounded-full"
			role="img"
			style={`background: conic-gradient(#7c3aed 0 ${value}%, #22c55e ${value}% ${value + 14}%, #26314a ${value + 14}% 100%)`}
		>
			<div class="grid h-[5.95rem] w-[5.95rem] place-items-center rounded-full bg-ink-850">
				<span class="text-3xl font-bold text-slate-50">{formatPercent(value)}</span>
			</div>
		</div>

		<div class="space-y-4">
			<p class="max-w-xs text-sm leading-6 text-slate-300">{description}</p>
			<Button size="sm" onclick={() => goto(resolve('/reports'))}>View Full Report</Button>
		</div>
	</div>
</Card>
