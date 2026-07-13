<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import SimulationCreateScreen from '$lib/features/simulations/SimulationCreateScreen.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<SimulationCreateScreen
	result={form}
	simulationForm={{
		...data.simulationForm,
		values: form?.values ?? data.simulationForm.values
	}}
/>
