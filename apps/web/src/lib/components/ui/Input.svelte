<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	let { class: className = '', value = $bindable(), ...rest }: HTMLInputAttributes = $props();
</script>

<input
	class={[
		'h-11 w-full rounded-md border border-border bg-ink-950/55 px-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-brand-light focus:ring-2 focus:ring-brand-light/20',
		className
	]}
	bind:value
	{...rest}
/>
