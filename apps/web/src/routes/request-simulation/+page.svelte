<script lang="ts">
	import RequestAgentScreen from '$lib/features/request-agent/RequestAgentScreen.svelte';

	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form?: ActionData } = $props();
</script>

<RequestAgentScreen form={form ?? undefined} initialValues={data.initialValues} />
