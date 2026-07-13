<script lang="ts">
	import { Search, Users } from 'lucide-svelte';

	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { CustomerAgentListViewModel } from '$lib/types/customer';

	let { customersData }: { customersData: CustomerAgentListViewModel } = $props();
</script>

<div>
	<PageHeader subtitle="AI customer personas generated for your simulations" title="Customers" />

	<Card class="p-4 sm:p-5">
		<form class="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_12rem_auto]" method="GET">
			<label class="relative block">
				<span class="sr-only">Search customers</span>
				<Search
					aria-hidden="true"
					class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-500"
					size={16}
				/>
				<Input
					class="pl-10"
					name="search"
					placeholder="Search personas, locations, occupations..."
					value={customersData.filters.search ?? ''}
				/>
			</label>
			<label>
				<span class="sr-only">Filter by simulation</span>
				<Select name="simulationId" value={customersData.filters.simulationId ?? 'all'}>
					{#each customersData.simulationOptions as option (option.value)}
						<option value={option.value}>{option.label}</option>
					{/each}
				</Select>
			</label>
			<label>
				<span class="sr-only">Filter by price sensitivity</span>
				<Select name="priceSensitivity" value={customersData.filters.priceSensitivity ?? 'all'}>
					{#each customersData.priceSensitivityOptions as option (option.value)}
						<option value={option.value}>{option.label}</option>
					{/each}
				</Select>
			</label>
			<Button type="submit" variant="secondary">Apply</Button>
		</form>
	</Card>

	{#if customersData.customers.length === 0}
		<EmptyState
			class="mt-5"
			description="Customer personas from accessible simulations will appear here."
			title="No customer agents found"
		/>
	{:else}
		<div class="mt-5 grid gap-4 xl:grid-cols-2">
			{#each customersData.customers as customer (customer.id)}
				<Card interactive class="p-5">
					<article class="flex min-w-0 gap-4">
						<div
							class="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-border bg-ink-800"
						>
							<img
								alt={customer.avatarAlt}
								class="h-11 w-11 rounded-full object-cover"
								height="44"
								src={customer.avatarSrc}
								width="44"
							/>
						</div>
						<div class="min-w-0 flex-1">
							<div class="flex flex-wrap items-start justify-between gap-3">
								<div>
									<h2 class="text-base font-bold text-slate-50">
										{customer.name}
										<span class="font-medium text-slate-500">(Age {customer.age})</span>
									</h2>
									<p class="mt-1 text-xs text-slate-500">{customer.relatedSimulation.title}</p>
								</div>
								<Badge tone={customer.isActive ? 'success' : 'neutral'}>
									{customer.isActive ? 'Active' : 'Inactive'}
								</Badge>
							</div>

							<dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2">
								<div>
									<dt class="text-xs text-slate-500">Location</dt>
									<dd class="mt-1 text-slate-200">{customer.location}</dd>
								</div>
								<div>
									<dt class="text-xs text-slate-500">Occupation</dt>
									<dd class="mt-1 text-slate-200">{customer.occupation}</dd>
								</div>
								<div>
									<dt class="text-xs text-slate-500">Income level</dt>
									<dd class="mt-1 text-slate-200">{customer.incomeLevel}</dd>
								</div>
								<div>
									<dt class="text-xs text-slate-500">Price sensitivity</dt>
									<dd class="mt-1 text-slate-200">{customer.priceSensitivityLabel}</dd>
								</div>
							</dl>

							<div class="mt-4 rounded-md border border-border/70 bg-ink-950/32 p-3">
								<div class="flex items-center gap-2 text-xs font-semibold text-slate-300">
									<Users aria-hidden="true" size={14} />
									Communication style
								</div>
								<p class="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
									{customer.communicationStyle}
								</p>
							</div>
						</div>
					</article>
				</Card>
			{/each}
		</div>
	{/if}
</div>
