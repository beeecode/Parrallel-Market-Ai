<script lang="ts">
	import { TriangleAlert } from 'lucide-svelte';

	let { message }: { message?: string } = $props();
</script>

{#if message}
	<div class="flex gap-3 rounded-lg border border-red-500/35 bg-red-500/10 p-4" role="alert">
		<TriangleAlert aria-hidden="true" class="mt-0.5 shrink-0 text-red-300" size={18} />
		<p class="text-sm leading-6 text-red-100">{message}</p>
	</div>
{/if}
