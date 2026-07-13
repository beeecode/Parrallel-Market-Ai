<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ArrowLeft, Play, Plus } from 'lucide-svelte';

	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import type { ProductDetailViewModel } from '$lib/types/product';

	let { product }: { product: ProductDetailViewModel } = $props();
</script>

<div>
	<PageHeader subtitle={product.category} title={product.name}>
		{#snippet actions()}
			<Button onclick={() => goto(resolve('/products'))} variant="secondary">
				<ArrowLeft aria-hidden="true" size={16} />
				Products
			</Button>
			<Button onclick={() => goto(resolve('/simulations/new'))}>
				<Plus aria-hidden="true" size={16} />
				Create Simulation
			</Button>
		{/snippet}
	</PageHeader>

	<div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
		<div class="space-y-5">
			<Card class="p-5">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<h2 class="text-sm font-semibold text-slate-100">Product overview</h2>
					<Badge tone={product.status === 'active' ? 'success' : 'purple'}>
						{product.statusLabel}
					</Badge>
				</div>
				<p class="mt-4 max-w-3xl text-sm leading-7 text-slate-300">{product.description}</p>
				<dl class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
					<div class="rounded-md border border-border/70 bg-ink-950/35 p-4">
						<dt class="text-xs text-slate-500">Current price</dt>
						<dd class="mt-2 text-lg font-bold text-brand-light">{product.currentPrice}</dd>
					</div>
					<div class="rounded-md border border-border/70 bg-ink-950/35 p-4">
						<dt class="text-xs text-slate-500">Target market</dt>
						<dd class="mt-2 text-sm font-semibold text-slate-100">{product.targetMarket}</dd>
					</div>
					<div class="rounded-md border border-border/70 bg-ink-950/35 p-4">
						<dt class="text-xs text-slate-500">Target location</dt>
						<dd class="mt-2 text-sm font-semibold text-slate-100">{product.targetLocation}</dd>
					</div>
					<div class="rounded-md border border-border/70 bg-ink-950/35 p-4">
						<dt class="text-xs text-slate-500">Updated</dt>
						<dd class="mt-2 text-sm font-semibold text-slate-100">{product.updatedAt}</dd>
					</div>
				</dl>
			</Card>

			<Card class="p-5">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<h2 class="text-sm font-semibold text-slate-100">Related simulations</h2>
					<a
						class="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold text-purple-200 hover:bg-brand/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
						href={resolve('/simulations/new')}
					>
						<Plus aria-hidden="true" size={15} />
						New simulation
					</a>
				</div>

				{#if product.relatedSimulations.length === 0}
					<EmptyState
						class="mt-4"
						description="Create a simulation from this product to start collecting market evidence."
						title="No simulations yet"
					/>
				{:else}
					<div class="mt-4 divide-y divide-border/70">
						{#each product.relatedSimulations as simulation (simulation.id)}
							<a
								class="flex flex-col gap-3 py-4 transition hover:bg-white/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light sm:flex-row sm:items-center sm:justify-between"
								href={resolve('/simulations/[id]/live', { id: simulation.id })}
							>
								<div>
									<h3 class="text-sm font-semibold text-slate-100">{simulation.title}</h3>
									<p class="mt-1 text-xs text-slate-500">Updated {simulation.updatedAt}</p>
								</div>
								<div class="flex items-center gap-3">
									<Badge tone={simulation.status === 'completed' ? 'success' : 'purple'}>
										{simulation.statusLabel}
									</Badge>
									<span class="text-xs text-slate-400">{simulation.successProbability}</span>
									<Play aria-hidden="true" class="text-brand-light" size={15} />
								</div>
							</a>
						{/each}
					</div>
				{/if}
			</Card>
		</div>

		<Card class="h-fit p-5">
			<h2 class="text-sm font-semibold text-slate-100">Product metadata</h2>
			<dl class="mt-4 space-y-4 text-sm">
				<div>
					<dt class="text-xs text-slate-500">Created</dt>
					<dd class="mt-1 text-slate-200">{product.createdAt}</dd>
				</div>
				<div>
					<dt class="text-xs text-slate-500">Currency</dt>
					<dd class="mt-1 text-slate-200">{product.currency}</dd>
				</div>
				<div>
					<dt class="text-xs text-slate-500">Status</dt>
					<dd class="mt-1 text-slate-200">{product.statusLabel}</dd>
				</div>
			</dl>
		</Card>
	</div>
</div>
