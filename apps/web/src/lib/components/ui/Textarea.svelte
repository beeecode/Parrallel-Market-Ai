<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	let { class: className = '', value = $bindable(), ...rest }: HTMLTextareaAttributes = $props();
</script>

<textarea
	class={[
		'min-h-28 w-full resize-y rounded-md border border-border bg-ink-950/55 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-brand-light focus:ring-2 focus:ring-brand-light/20',
		className
	]}
	bind:value
	{...rest}></textarea>
