<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import type { LayoutData } from './$types';

	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import AppShell from '$lib/components/layout/AppShell.svelte';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta
		name="description"
		content="Parallel Market AI market simulation dashboard and insights workspace."
	/>
	<title>Parallel Market AI</title>
</svelte:head>

{#if data.user && page.url.pathname !== '/'}
	<AppShell user={data.user}>
		{@render children()}
	</AppShell>
{:else}
	{@render children()}
{/if}
