<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		class: className = '',
		interactive = false
	}: {
		children: Snippet;
		class?: string;
		interactive?: boolean;
	} = $props();
</script>

<section
	class={[
		'rounded-lg border border-border/90 bg-[linear-gradient(145deg,rgba(13,19,36,0.92),rgba(9,15,28,0.82))] shadow-[0_10px_24px_rgba(0,0,0,0.08)]',
		interactive &&
			'transition duration-200 hover:-translate-y-px hover:border-brand-light/35 hover:bg-ink-850/95',
		className
	]}
>
	{@render children()}
</section>
