<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Tone } from '$lib/types/common';

	let {
		children,
		tone = 'neutral',
		class: className = ''
	}: {
		children: Snippet;
		tone?: Tone;
		class?: string;
	} = $props();

	const toneClasses: Record<Tone, string> = {
		success: 'border-success/30 bg-success/10 text-green-300',
		purple: 'border-brand-light/30 bg-brand/15 text-purple-200',
		warning: 'border-warning/30 bg-warning/10 text-yellow-200',
		danger: 'border-danger/30 bg-danger/10 text-red-200',
		neutral: 'border-slate-500/30 bg-slate-500/10 text-slate-300'
	};
</script>

<span
	class={[
		'inline-flex items-center rounded border px-2 py-1 text-[10px] leading-none font-semibold',
		toneClasses[tone],
		className
	]}
>
	{@render children()}
</span>
