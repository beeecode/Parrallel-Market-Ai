<script lang="ts">
	let { id, message }: { id: string; message?: string } = $props();
</script>

{#if message}
	<p class="mt-2 text-xs leading-5 text-red-300" {id} role="alert">{message}</p>
{/if}
