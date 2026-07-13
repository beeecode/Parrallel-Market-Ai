<script lang="ts">
	import { ArrowLeft, ArrowRight } from 'lucide-svelte';

	import Button from '$lib/components/ui/Button.svelte';

	let {
		canGoBack,
		continueLabel = 'Continue',
		onback,
		oncontinue
	}: {
		canGoBack: boolean;
		continueLabel?: string;
		onback?: () => void;
		oncontinue?: () => void;
	} = $props();
</script>

<div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
	<Button disabled={!canGoBack} onclick={onback} type="button" variant="secondary">
		<ArrowLeft aria-hidden="true" size={16} />
		Back
	</Button>
	<Button onclick={oncontinue} type="button">
		{continueLabel}
		<ArrowRight aria-hidden="true" size={16} />
	</Button>
</div>
