<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import AppShell from '$lib/components/layout/AppShell.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta
		name="description"
		content="Parallel Market AI market simulation dashboard and insights workspace."
	/>
	<title>Parallel Market AI</title>
</svelte:head>

<AppShell>
	{@render children()}
</AppShell>
