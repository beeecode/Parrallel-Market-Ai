<script lang="ts">
	import type { PageData } from './$types';
	import CustomersScreen from '$lib/features/customers/CustomersScreen.svelte';

	let { data }: { data: PageData } = $props();
</script>

<CustomersScreen customersData={data.customers} />
