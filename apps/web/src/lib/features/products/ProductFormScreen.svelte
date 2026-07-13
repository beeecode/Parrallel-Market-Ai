<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { ArrowLeft, Check, Save } from 'lucide-svelte';

	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import FormError from '$lib/components/ui/FormError.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import type { ProductFormInput, ProductFormResult } from '$lib/types/product';

	let {
		values,
		result
	}: {
		values: ProductFormInput;
		result?: ProductFormResult | null;
	} = $props();

	let pending = $state(false);
	let formValues = $derived<ProductFormInput>({ ...values });
	const errors = $derived(result?.errors ?? {});

	const enhanceForm: SubmitFunction = () => {
		pending = true;
		return async ({ result, update }) => {
			if (result.type === 'redirect') {
				const productId = result.location.split('/').filter(Boolean).at(-1) ?? '';
				await goto(resolve('/products/[id]', { id: productId }), { invalidateAll: true });
			} else {
				await update({ reset: false });
			}
			pending = false;
		};
	};
</script>

<div>
	<PageHeader
		subtitle="Add a business idea that can be used as the source for market simulations"
		title="New Product"
	>
		{#snippet actions()}
			<Button onclick={() => goto(resolve('/products'))} variant="secondary">
				<ArrowLeft aria-hidden="true" size={16} />
				Products
			</Button>
		{/snippet}
	</PageHeader>

	<form
		class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]"
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
				<h2 class="text-sm font-semibold text-slate-100">Product basics</h2>
				<div class="mt-4 grid gap-4 md:grid-cols-2">
					<label class="md:col-span-2">
						<span class="text-xs font-semibold text-slate-400">Product name</span>
						<Input
							aria-describedby={errors.name ? 'product-name-error' : undefined}
							aria-invalid={Boolean(errors.name)}
							bind:value={formValues.name}
							id="product-name"
							name="name"
							placeholder="Shawarma Spot Menu"
							required
						/>
						<FormError id="product-name-error" message={errors.name} />
					</label>
					<label>
						<span class="text-xs font-semibold text-slate-400">Category</span>
						<Input
							aria-describedby={errors.category ? 'product-category-error' : undefined}
							aria-invalid={Boolean(errors.category)}
							bind:value={formValues.category}
							id="product-category"
							name="category"
							placeholder="Food delivery"
							required
						/>
						<FormError id="product-category-error" message={errors.category} />
					</label>
					<label>
						<span class="text-xs font-semibold text-slate-400">Status</span>
						<Select bind:value={formValues.status} name="status">
							<option value="draft">Draft</option>
							<option value="active">Active</option>
							<option value="inactive">Inactive</option>
							<option value="archived">Archived</option>
						</Select>
						<FormError id="product-status-error" message={errors.status} />
					</label>
					<label class="md:col-span-2">
						<span class="text-xs font-semibold text-slate-400">Description</span>
						<Textarea
							aria-describedby={errors.description ? 'product-description-error' : undefined}
							aria-invalid={Boolean(errors.description)}
							bind:value={formValues.description}
							id="product-description"
							name="description"
							placeholder="Describe the product, offer, menu, app, or business idea."
							required
						/>
						<FormError id="product-description-error" message={errors.description} />
					</label>
				</div>
			</Card>

			<Card class="p-5">
				<h2 class="text-sm font-semibold text-slate-100">Pricing</h2>
				<div class="mt-4 grid gap-4 md:grid-cols-2">
					<label>
						<span class="text-xs font-semibold text-slate-400">Current price</span>
						<Input
							aria-describedby={errors.currentPrice ? 'product-price-error' : undefined}
							aria-invalid={Boolean(errors.currentPrice)}
							bind:value={formValues.currentPrice}
							id="product-price"
							min="0"
							name="currentPrice"
							placeholder="4200"
							required
							type="number"
						/>
						<FormError id="product-price-error" message={errors.currentPrice} />
					</label>
					<label>
						<span class="text-xs font-semibold text-slate-400">Currency</span>
						<Select bind:value={formValues.currency} name="currency">
							<option value="NGN">NGN</option>
							<option value="USD">USD</option>
							<option value="GBP">GBP</option>
							<option value="EUR">EUR</option>
						</Select>
						<FormError id="product-currency-error" message={errors.currency} />
					</label>
				</div>
			</Card>

			<Card class="p-5">
				<h2 class="text-sm font-semibold text-slate-100">Target market</h2>
				<div class="mt-4 grid gap-4 md:grid-cols-2">
					<label>
						<span class="text-xs font-semibold text-slate-400">Target market</span>
						<Input
							aria-describedby={errors.targetMarket ? 'product-market-error' : undefined}
							aria-invalid={Boolean(errors.targetMarket)}
							bind:value={formValues.targetMarket}
							id="product-market"
							name="targetMarket"
							placeholder="Urban food delivery customers"
							required
						/>
						<FormError id="product-market-error" message={errors.targetMarket} />
					</label>
					<label>
						<span class="text-xs font-semibold text-slate-400">Target location</span>
						<Input
							aria-describedby={errors.targetLocation ? 'product-location-error' : undefined}
							aria-invalid={Boolean(errors.targetLocation)}
							bind:value={formValues.targetLocation}
							id="product-location"
							name="targetLocation"
							placeholder="Lagos, Nigeria"
							required
						/>
						<FormError id="product-location-error" message={errors.targetLocation} />
					</label>
				</div>
			</Card>
		</div>

		<Card class="h-fit p-5 xl:sticky xl:top-8">
			<h2 class="text-sm font-semibold text-slate-100">Create product</h2>
			<p class="mt-2 text-sm leading-6 text-slate-400">
				Products stay private to your workspace and can be used to launch new simulations.
			</p>
			<div class="mt-5 grid gap-3">
				<Button disabled={pending} type="submit" variant="secondary">
					<Save aria-hidden="true" class={pending ? 'animate-pulse' : ''} size={16} />
					Save Draft
				</Button>
				<Button disabled={pending} type="submit">
					<Check aria-hidden="true" class={pending ? 'animate-pulse' : ''} size={16} />
					Create Product
				</Button>
			</div>
			<a
				class="mt-4 inline-flex text-sm font-semibold text-slate-400 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
				href={resolve('/products')}
			>
				Cancel and go back
			</a>
		</Card>
	</form>
</div>
