<script lang="ts">
	import { CircleAlert } from 'lucide-svelte';
	import Card from '$lib/components/ui/Card.svelte';

	let { title, items }: { title: string; items: string[] } = $props();
</script>

<Card class="p-5">
	<h2 class="text-sm font-semibold text-red-300">{title}</h2>
	<ul class="mt-4 space-y-3">
		{#each items as item (item)}
			<li class="flex items-start gap-3 text-xs leading-5 text-slate-300">
				<CircleAlert
					aria-hidden="true"
					class="mt-0.5 shrink-0 text-red-400"
					size={14}
					strokeWidth={1.8}
				/>
				{item}
			</li>
		{/each}
	</ul>
</Card>
