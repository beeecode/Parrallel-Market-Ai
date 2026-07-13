<script lang="ts">
	import type { PageData } from './$types';
	import ReportScreen from '$lib/features/reports/ReportScreen.svelte';

	let { data }: { data: PageData } = $props();
</script>

<ReportScreen reportData={data.report} />
