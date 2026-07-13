<script lang="ts">
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';

	import ErrorState from '$lib/components/ui/ErrorState.svelte';

	async function retry(): Promise<void> {
		await invalidateAll();
		window.location.reload();
	}
</script>

<div class="mx-auto flex min-h-[65vh] max-w-2xl items-center justify-center px-4 py-12">
	<ErrorState
		description={page.error?.message || 'The requested information could not be loaded.'}
		onretry={retry}
		title={`Error ${page.status}`}
	/>
</div>
