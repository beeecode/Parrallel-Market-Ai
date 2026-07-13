<script lang="ts">
	import type { PageData } from './$types';
	import ProductsScreen from '$lib/features/products/ProductsScreen.svelte';

	let { data }: { data: PageData } = $props();
</script>

<ProductsScreen productsData={data.products} />
