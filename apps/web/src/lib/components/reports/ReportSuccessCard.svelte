<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import { formatPercent } from '$lib/utils/format';

	let { value, label }: { value: number; label: string } = $props();
</script>

<Card class="p-5">
	<h2 class="text-sm font-semibold text-slate-100">Success Probability</h2>
	<div class="mt-5 flex items-center gap-5">
		<div
			aria-label={`Success probability ${value}%`}
			class="grid h-24 w-24 shrink-0 place-items-center rounded-full"
			role="img"
			style={`background: conic-gradient(#65d88c 0 ${value}%, #26314a ${value}% 100%)`}
		>
			<div class="grid h-[4.75rem] w-[4.75rem] place-items-center rounded-full bg-ink-850">
				<span class="text-2xl font-bold text-slate-50">{formatPercent(value)}</span>
			</div>
		</div>
		<p class="max-w-32 text-xs leading-5 font-medium text-slate-300">{label}</p>
	</div>
</Card>
