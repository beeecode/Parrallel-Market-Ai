<script lang="ts">
	import type { PageData } from './$types';
	import InsightsScreen from '$lib/features/insights/InsightsScreen.svelte';

	let { data }: { data: PageData } = $props();
</script>

<InsightsScreen insights={data.insights} />
