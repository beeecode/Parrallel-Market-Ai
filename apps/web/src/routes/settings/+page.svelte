<script lang="ts">
	import type { PageData } from './$types';
	import SettingsScreen from '$lib/features/settings/SettingsScreen.svelte';

	let { data }: { data: PageData } = $props();
</script>

<SettingsScreen settings={data.settings} />
