<script lang="ts">
	import { Send } from 'lucide-svelte';

	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let {
		value,
		error,
		onchange,
		onsubmit
	}: {
		value: string;
		error?: string;
		onchange: (value: string) => void;
		onsubmit: () => void;
	} = $props();

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			onsubmit();
		}
	}
</script>

<div class="border-t border-border/80 bg-ink-900/55 p-3">
	<div class="flex items-center gap-2 rounded-lg border border-border bg-ink-950/50 p-1.5">
		<label class="sr-only" for="simulation-message">Type a message</label>
		<Input
			aria-describedby={error ? 'simulation-message-error' : undefined}
			aria-invalid={Boolean(error)}
			class="h-9 border-0 bg-transparent px-3 focus:ring-0"
			id="simulation-message"
			oninput={(event) => onchange(event.currentTarget.value)}
			onkeydown={handleKeydown}
			placeholder="Type a message..."
			{value}
		/>
		<Button
			aria-label="Send message"
			disabled={!value.trim()}
			onclick={onsubmit}
			size="icon"
			class="h-9 w-9 rounded-full"
		>
			<Send aria-hidden="true" size={17} />
		</Button>
	</div>
	{#if error}
		<p class="mt-2 text-xs text-red-300" id="simulation-message-error" role="alert">{error}</p>
	{/if}
</div>
