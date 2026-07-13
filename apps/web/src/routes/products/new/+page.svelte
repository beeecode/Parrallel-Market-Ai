<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import ProductFormScreen from '$lib/features/products/ProductFormScreen.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<ProductFormScreen result={form} values={form?.values ?? data.values} />
