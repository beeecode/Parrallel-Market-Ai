<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import LiveSimulationScreen from '$lib/features/simulations/LiveSimulationScreen.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<LiveSimulationScreen
	messageDraft={form?.messageDraft}
	messageError={form?.messageError}
	simulationData={data.simulation}
/>
