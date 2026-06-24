<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';

	let {
		title = 'Something went wrong',
		description = 'The data could not be prepared. Try again in a moment.',
		onretry,
		class: className = ''
	}: {
		title?: string;
		description?: string;
		onretry?: () => void;
		class?: string;
	} = $props();
</script>

<div
	class={['rounded-lg border border-danger/30 bg-danger/10 p-6 text-sm', className]}
	role="alert"
>
	<h3 class="font-semibold text-red-200">{title}</h3>
	<p class="mt-2 leading-6 text-red-100/75">{description}</p>
	{#if onretry}
		<div class="mt-4">
			<Button variant="secondary" size="sm" onclick={onretry}>Retry</Button>
		</div>
	{/if}
</div>
