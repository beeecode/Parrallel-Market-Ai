<script lang="ts">
	import { tick } from 'svelte';
	import type { ChatMessage } from '$lib/types/simulation';

	let { messages }: { messages: ChatMessage[] } = $props();
	let thread: HTMLDivElement;

	function scrollToLatest(messageCount: number): void {
		if (messageCount === 0) return;

		void tick().then(() => {
			if (thread) thread.scrollTop = thread.scrollHeight;
		});
	}

	$effect(() => {
		scrollToLatest(messages.length);
	});
</script>

<div
	aria-label="Live simulation conversation"
	bind:this={thread}
	class="flex min-h-[25rem] w-full min-w-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.055),transparent_34%)] px-4 py-5 sm:px-6"
	role="log"
>
	{#each messages as message (message.id)}
		<div
			class={[
				'flex',
				message.sender === 'business'
					? 'justify-end'
					: message.sender === 'system'
						? 'justify-center'
						: 'justify-start'
			]}
		>
			<div
				class={[
					'max-w-[86%] rounded-lg px-4 py-2.5 text-xs leading-5 sm:max-w-[68%]',
					message.sender === 'business'
						? 'rounded-br-sm border border-emerald-700/45 bg-emerald-800/78 text-white'
						: message.sender === 'system'
							? 'border border-border bg-ink-800 text-slate-300'
							: 'rounded-bl-sm bg-slate-100 text-slate-950'
				]}
			>
				<p>{message.body}</p>
				<p
					class={[
						'mt-1 text-right text-[9px]',
						message.sender === 'business' ? 'text-emerald-100/70' : 'text-slate-500'
					]}
				>
					{message.timestamp}
				</p>
			</div>
		</div>
	{/each}
</div>
