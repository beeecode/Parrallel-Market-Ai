<script lang="ts">
	import type { PageData } from './$types';
	import DashboardScreen from '$lib/features/dashboard/DashboardScreen.svelte';

	let { data }: { data: PageData } = $props();
</script>

<DashboardScreen dashboard={data.dashboard} />
