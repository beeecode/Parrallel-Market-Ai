<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ArrowUpRight, Plus, Search } from 'lucide-svelte';

	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import type { ProductListViewModel } from '$lib/types/product';

	let { productsData }: { productsData: ProductListViewModel } = $props();
</script>

<div>
	<PageHeader subtitle="Manage products and business ideas for market simulation" title="Products">
		{#snippet actions()}
			<Button onclick={() => goto(resolve('/products/new'))}>
				<Plus aria-hidden="true" size={17} strokeWidth={2} />
				New Product
			</Button>
		{/snippet}
	</PageHeader>

	<Card class="p-4 sm:p-5">
		<form class="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_12rem_auto]" method="GET">
			<label class="relative block">
				<span class="sr-only">Search products</span>
				<Search
					aria-hidden="true"
					class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-500"
					size={16}
				/>
				<Input
					class="pl-10"
					name="search"
					placeholder="Search products, categories, markets..."
					value={productsData.filters.search ?? ''}
				/>
			</label>

			<label>
				<span class="sr-only">Filter by status</span>
				<Select name="status" value={productsData.filters.status ?? 'all'}>
					{#each productsData.statusOptions as option (option.value)}
						<option value={option.value}>{option.label}</option>
					{/each}
				</Select>
			</label>

			<label>
				<span class="sr-only">Filter by category</span>
				<Select name="category" value={productsData.filters.category ?? ''}>
					<option value="">All categories</option>
					{#each productsData.categories as category (category)}
						<option value={category}>{category}</option>
					{/each}
				</Select>
			</label>

			<Button type="submit" variant="secondary">Apply</Button>
		</form>
	</Card>

	{#if productsData.products.length === 0}
		<EmptyState
			class="mt-5"
			description="Products you can access will appear here. Create a product to start configuring simulations."
			title="No products found"
		/>
	{:else}
		<div class="mt-5 grid gap-4 lg:grid-cols-2">
			{#each productsData.products as product (product.id)}
				<Card interactive class="p-5">
					<article class="flex h-full min-w-0 flex-col gap-5">
						<div class="flex items-start justify-between gap-4">
							<div class="min-w-0">
								<p class="text-xs font-medium text-slate-500">{product.category}</p>
								<h2 class="mt-1 truncate text-lg font-bold tracking-normal text-slate-50">
									{product.name}
								</h2>
							</div>
							<Badge tone={product.statusTone}>{product.statusLabel}</Badge>
						</div>

						<dl class="grid gap-3 text-sm sm:grid-cols-2">
							<div class="rounded-md border border-border/70 bg-ink-950/32 p-3">
								<dt class="text-xs text-slate-500">Current price</dt>
								<dd class="mt-1 font-semibold text-brand-light">{product.currentPrice}</dd>
							</div>
							<div class="rounded-md border border-border/70 bg-ink-950/32 p-3">
								<dt class="text-xs text-slate-500">Simulations</dt>
								<dd class="mt-1 font-semibold text-slate-100">{product.simulationCount}</dd>
							</div>
						</dl>

						<div class="grid gap-3 text-sm md:grid-cols-2">
							<div>
								<p class="text-xs text-slate-500">Target market</p>
								<p class="mt-1 line-clamp-2 text-slate-300">{product.targetMarket}</p>
							</div>
							<div>
								<p class="text-xs text-slate-500">Target location</p>
								<p class="mt-1 text-slate-300">{product.targetLocation}</p>
							</div>
						</div>

						<div
							class="mt-auto flex items-center justify-between gap-4 border-t border-border/70 pt-4"
						>
							<p class="text-xs text-slate-500">Updated {product.updatedAt}</p>
							<a
								class="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold text-purple-200 transition hover:bg-brand/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
								href={resolve('/products/[id]', { id: product.id })}
							>
								View details
								<ArrowUpRight aria-hidden="true" size={15} />
							</a>
						</div>
					</article>
				</Card>
			{/each}
		</div>
	{/if}
</div>
