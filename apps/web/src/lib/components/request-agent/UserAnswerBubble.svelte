<script lang="ts">
	import type { RequestAgentField } from '$lib/types/request-agent';

	let {
		field,
		label,
		onedit,
		value
	}: {
		field: RequestAgentField;
		label: string;
		onedit?: (field: RequestAgentField) => void;
		value: string;
	} = $props();
</script>

<button
	class="w-full rounded-md border border-border/70 bg-ink-950/40 px-3 py-2 text-left transition hover:border-brand-light/45 hover:bg-brand/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
	onclick={() => onedit?.(field)}
	type="button"
>
	<span class="block text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-slate-500">
		{label}
	</span>
	<span class="mt-1 line-clamp-2 block text-xs leading-5 text-slate-200">{value}</span>
</button>
