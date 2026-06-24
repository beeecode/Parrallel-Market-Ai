<script lang="ts">
	let {
		title,
		description,
		class: className = ''
	}: { title: string; description: string; class?: string } = $props();
</script>

<div
	class={['rounded-lg border border-dashed border-border bg-ink-900/35 p-6 text-center', className]}
>
	<h3 class="text-sm font-semibold text-slate-100">{title}</h3>
	<p class="mt-2 text-sm leading-6 text-slate-400">{description}</p>
</div>
