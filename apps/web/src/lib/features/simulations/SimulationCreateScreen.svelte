<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { ArrowLeft, Check, Play, SlidersHorizontal } from 'lucide-svelte';

	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import FormError from '$lib/components/ui/FormError.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import type {
		SimulationCreateResult,
		SimulationCreateViewModel
	} from '$lib/types/simulation-form';

	let {
		simulationForm,
		result
	}: {
		simulationForm: SimulationCreateViewModel;
		result?: SimulationCreateResult | null;
	} = $props();

	let pending = $state(false);
	let values = $derived({ ...simulationForm.values });
	const errors = $derived(result?.errors ?? {});
	const selectedProduct = $derived(
		simulationForm.productOptions.find((product) => product.id === values.product)
	);

	const enhanceForm: SubmitFunction = () => {
		pending = true;
		return async ({ result, update }) => {
			if (result.type === 'redirect') {
				const simulationId = result.location.match(/\/simulations\/([^/]+)\/live/)?.[1] ?? '';
				await goto(resolve('/simulations/[id]/live', { id: simulationId }), {
					invalidateAll: true
				});
			} else {
				await update({ reset: false });
			}
			pending = false;
		};
	};
</script>

<div>
	<PageHeader
		subtitle="Configure a draft market simulation from an existing product"
		title="New Simulation"
	>
		{#snippet actions()}
			<Button onclick={() => goto(resolve('/simulations'))} variant="secondary">
				<ArrowLeft aria-hidden="true" size={16} />
				Simulations
			</Button>
		{/snippet}
	</PageHeader>

	{#if simulationForm.productOptions.length === 0}
		<EmptyState
			description="Create an accessible product before configuring a simulation."
			title="No products available"
		/>
	{:else}
		<form
			class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]"
			method="POST"
			use:enhance={enhanceForm}
		>
			<div class="space-y-5">
				{#if errors.form}
					<Card class="border-danger/40 bg-danger/10 p-4">
						<p class="text-sm text-red-200" role="alert">{errors.form}</p>
					</Card>
				{/if}

				<Card class="p-5">
					<h2 class="text-sm font-semibold text-slate-100">Product selection</h2>
					<div class="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_14rem]">
						<label>
							<span class="text-xs font-semibold text-slate-400">Product</span>
							<Select
								aria-describedby={errors.product ? 'simulation-product-error' : undefined}
								aria-invalid={Boolean(errors.product)}
								bind:value={values.product}
								id="simulation-product"
								name="product"
								required
							>
								<option value="">Choose a product</option>
								{#each simulationForm.productOptions as product (product.id)}
									<option value={product.id}>{product.name}</option>
								{/each}
							</Select>
							<FormError id="simulation-product-error" message={errors.product} />
						</label>
						<label>
							<span class="text-xs font-semibold text-slate-400">Customer count</span>
							<Input
								aria-describedby={errors.customerCount ? 'simulation-count-error' : undefined}
								aria-invalid={Boolean(errors.customerCount)}
								bind:value={values.customerCount}
								id="simulation-count"
								min="1"
								name="customerCount"
								required
								type="number"
							/>
							<FormError id="simulation-count-error" message={errors.customerCount} />
						</label>
					</div>
				</Card>

				<Card class="p-5">
					<h2 class="text-sm font-semibold text-slate-100">Audience and location</h2>
					<div class="mt-4 grid gap-4 md:grid-cols-2">
						<label class="md:col-span-2">
							<span class="text-xs font-semibold text-slate-400">Simulation title</span>
							<Input
								aria-describedby={errors.title ? 'simulation-title-error' : undefined}
								aria-invalid={Boolean(errors.title)}
								bind:value={values.title}
								id="simulation-title"
								name="title"
								placeholder="Shawarma Spot Menu - Lagos pricing test"
								required
							/>
							<FormError id="simulation-title-error" message={errors.title} />
						</label>
						<label>
							<span class="text-xs font-semibold text-slate-400">Target audience</span>
							<Textarea
								aria-describedby={errors.targetAudience ? 'simulation-audience-error' : undefined}
								aria-invalid={Boolean(errors.targetAudience)}
								bind:value={values.targetAudience}
								id="simulation-audience"
								name="targetAudience"
								placeholder="Young professionals ordering lunch through mobile delivery apps."
								required
							/>
							<FormError id="simulation-audience-error" message={errors.targetAudience} />
						</label>
						<label>
							<span class="text-xs font-semibold text-slate-400">Target location</span>
							<Textarea
								aria-describedby={errors.targetLocation ? 'simulation-location-error' : undefined}
								aria-invalid={Boolean(errors.targetLocation)}
								bind:value={values.targetLocation}
								id="simulation-location"
								name="targetLocation"
								placeholder="Lagos, Nigeria"
								required
							/>
							<FormError id="simulation-location-error" message={errors.targetLocation} />
						</label>
					</div>
				</Card>

				<Card class="p-5">
					<div class="flex items-center gap-3">
						<div
							class="grid h-9 w-9 place-items-center rounded-md border border-border bg-ink-950/55 text-brand-light"
						>
							<SlidersHorizontal aria-hidden="true" size={17} />
						</div>
						<h2 class="text-sm font-semibold text-slate-100">Simulation configuration</h2>
					</div>
					<div class="mt-4 grid gap-4">
						<label>
							<span class="text-xs font-semibold text-slate-400">Simulation goal</span>
							<Textarea
								aria-describedby={errors.simulationGoal ? 'simulation-goal-error' : undefined}
								aria-invalid={Boolean(errors.simulationGoal)}
								bind:value={values.simulationGoal}
								id="simulation-goal"
								name="simulationGoal"
								placeholder="Understand price sensitivity, delivery objections, and purchase intent."
								required
							/>
							<FormError id="simulation-goal-error" message={errors.simulationGoal} />
						</label>
						<div class="grid gap-4 md:grid-cols-2">
							<label>
								<span class="text-xs font-semibold text-slate-400">Market conditions</span>
								<Textarea bind:value={values.marketConditions} name="marketConditions" />
								<FormError id="simulation-market-error" message={errors.marketConditions} />
							</label>
							<label>
								<span class="text-xs font-semibold text-slate-400">Pricing strategy</span>
								<Textarea bind:value={values.pricingStrategy} name="pricingStrategy" />
								<FormError id="simulation-pricing-error" message={errors.pricingStrategy} />
							</label>
							<label>
								<span class="text-xs font-semibold text-slate-400">Customer segments</span>
								<Textarea
									bind:value={values.customerSegments}
									name="customerSegments"
									placeholder="Students, young professionals, families"
								/>
							</label>
							<label>
								<span class="text-xs font-semibold text-slate-400">Competitor context</span>
								<Textarea bind:value={values.competitorContext} name="competitorContext" />
								<FormError id="simulation-competitor-error" message={errors.competitorContext} />
							</label>
						</div>
						<label>
							<span class="text-xs font-semibold text-slate-400">Additional instructions</span>
							<Textarea
								bind:value={values.additionalInstructions}
								name="additionalInstructions"
								placeholder="Any special assumptions the analyst should consider later."
							/>
							<FormError
								id="simulation-instructions-error"
								message={errors.additionalInstructions}
							/>
						</label>
					</div>
				</Card>
			</div>

			<Card class="h-fit p-5 xl:sticky xl:top-8">
				<h2 class="text-sm font-semibold text-slate-100">Review draft</h2>
				{#if selectedProduct}
					<div class="mt-4 rounded-lg border border-border/80 bg-ink-950/35 p-4">
						<p class="text-sm font-semibold text-slate-100">{selectedProduct.name}</p>
						<p class="mt-1 text-xs text-slate-500">{selectedProduct.category}</p>
						<dl class="mt-4 space-y-3 text-xs">
							<div>
								<dt class="text-slate-500">Current price</dt>
								<dd class="mt-1 text-brand-light">{selectedProduct.currentPrice}</dd>
							</div>
							<div>
								<dt class="text-slate-500">Market</dt>
								<dd class="mt-1 text-slate-300">{selectedProduct.targetMarket}</dd>
							</div>
							<div>
								<dt class="text-slate-500">Location</dt>
								<dd class="mt-1 text-slate-300">{selectedProduct.targetLocation}</dd>
							</div>
						</dl>
					</div>
				{:else}
					<p class="mt-4 text-sm leading-6 text-slate-400">
						Select a product to preview the market context for this draft.
					</p>
				{/if}
				<div class="mt-5 flex flex-wrap gap-2">
					<Badge tone="purple">Draft only</Badge>
					<Badge tone="neutral">No engine start</Badge>
				</div>
				<div class="mt-5 grid gap-3">
					<Button disabled={pending} type="submit" variant="secondary">
						<Check aria-hidden="true" class={pending ? 'animate-pulse' : ''} size={16} />
						Save Draft
					</Button>
					<Button disabled={pending} type="submit">
						<Play aria-hidden="true" class={pending ? 'animate-pulse' : ''} size={16} />
						Create Simulation
					</Button>
				</div>
			</Card>
		</form>
	{/if}
</div>
