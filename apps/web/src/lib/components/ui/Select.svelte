<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';

	let {
		children,
		class: className = '',
		value = $bindable(),
		...rest
	}: HTMLSelectAttributes & { children: Snippet } = $props();
</script>

<select
	class={[
		'h-11 w-full rounded-md border border-border bg-ink-950/55 px-4 text-sm text-slate-100 outline-none transition focus:border-brand-light focus:ring-2 focus:ring-brand-light/20',
		className
	]}
	bind:value
	{...rest}
>
	{@render children()}
</select>
