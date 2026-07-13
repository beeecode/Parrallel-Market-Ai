<script lang="ts">
	import type { PageData } from './$types';

	import LandingPageScreen from '$lib/features/landing/LandingPageScreen.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Parallel Market AI — Simulate Your Market Before You Launch</title>
	<meta
		name="description"
		content="Explore customer reactions, pricing signals, objections, and structured market intelligence before launching your next product or campaign."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Parallel Market AI — Simulate Your Market Before You Launch" />
	<meta
		property="og:description"
		content="AI-assisted customer simulation, pricing signals, objection discovery, and structured market reports for stronger launch decisions."
	/>
	<meta name="twitter:card" content="summary" />
	<meta
		name="twitter:title"
		content="Parallel Market AI — Simulate Your Market Before You Launch"
	/>
	<meta
		name="twitter:description"
		content="Simulate market questions before you commit more time and budget to a launch."
	/>
</svelte:head>

<LandingPageScreen isAuthenticated={data.isAuthenticated} />
