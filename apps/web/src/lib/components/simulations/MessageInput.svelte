<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Send } from 'lucide-svelte';
	import { onMount } from 'svelte';

	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { ChatMessage } from '$lib/types/simulation';

	let {
		agentId,
		conversationId,
		simulationId,
		value,
		error,
		onchange,
		onsent
	}: {
		agentId: string;
		conversationId?: string;
		simulationId: string;
		value: string;
		error?: string;
		onchange: (value: string) => void;
		onsent?: (message: ChatMessage) => void;
	} = $props();

	let pending = $state(false);
	let submissionId = $state('');
	let form: HTMLFormElement;

	onMount(() => {
		submissionId = crypto.randomUUID();
	});

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			form?.requestSubmit();
		}
	}

	function isSavedMessage(value: unknown): value is ChatMessage {
		if (typeof value !== 'object' || value === null) return false;

		return (
			typeof Reflect.get(value, 'id') === 'string' &&
			typeof Reflect.get(value, 'body') === 'string' &&
			typeof Reflect.get(value, 'timestamp') === 'string' &&
			typeof Reflect.get(value, 'sentAt') === 'string' &&
			['business', 'customer', 'system'].includes(String(Reflect.get(value, 'sender')))
		);
	}

	function savedMessageFromAction(data: unknown): ChatMessage | null {
		if (typeof data !== 'object' || data === null) return null;

		const success = Reflect.get(data, 'success');
		const message = Reflect.get(data, 'message');

		return success === true && isSavedMessage(message) ? message : null;
	}

	const enhanceMessage: SubmitFunction = () => {
		pending = true;

		return async ({ result, update }) => {
			try {
				if (result.type === 'success') {
					const savedMessage = savedMessageFromAction(result.data);
					if (savedMessage) {
						onsent?.(savedMessage);
					}

					onchange('');
					submissionId = crypto.randomUUID();
					await update({
						invalidateAll: false,
						reset: false
					});
					void invalidateAll();
					return;
				}

				await update({
					invalidateAll: false,
					reset: false
				});
			} finally {
				pending = false;
			}
		};
	};
</script>

<form
	action="?/sendMessage"
	bind:this={form}
	class="border-t border-border/80 bg-ink-900/55 p-3"
	method="POST"
	use:enhance={enhanceMessage}
>
	<input name="agentId" type="hidden" value={agentId} />
	<input name="conversationId" type="hidden" value={conversationId || ''} />
	<input name="simulationId" type="hidden" value={simulationId} />
	<input name="submissionId" type="hidden" value={submissionId} />
	<div class="flex items-center gap-2 rounded-lg border border-border bg-ink-950/50 p-1.5">
		<label class="sr-only" for="simulation-message">Type a message</label>
		<Input
			aria-describedby={error ? 'simulation-message-error' : undefined}
			aria-invalid={Boolean(error)}
			class="h-9 border-0 bg-transparent px-3 focus:ring-0"
			id="simulation-message"
			maxlength={4000}
			name="content"
			oninput={(event) => onchange(event.currentTarget.value)}
			onkeydown={handleKeydown}
			placeholder="Type a message..."
			{value}
		/>
		<Button
			aria-label="Send message"
			disabled={pending || !conversationId || !submissionId || !value.trim()}
			size="icon"
			class="h-9 w-9 rounded-full"
			type="submit"
		>
			<Send aria-hidden="true" class={pending ? 'animate-pulse' : ''} size={17} />
		</Button>
	</div>
	{#if error}
		<p class="mt-2 text-xs text-red-300" id="simulation-message-error" role="alert">{error}</p>
	{/if}
</form>
