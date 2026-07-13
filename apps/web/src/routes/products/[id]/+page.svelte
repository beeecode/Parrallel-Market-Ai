<script lang="ts">
	import type { PageData } from './$types';
	import ProductDetailScreen from '$lib/features/products/ProductDetailScreen.svelte';

	let { data }: { data: PageData } = $props();
</script>

<ProductDetailScreen product={data.product} />
