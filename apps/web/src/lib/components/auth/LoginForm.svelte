<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { LoaderCircle, LockKeyhole } from 'lucide-svelte';

	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let {
		error,
		email = ''
	}: {
		error?: string;
		email?: string;
	} = $props();

	let pending = $state(false);

	async function navigateToRedirect(location: string): Promise<void> {
		const url = new URL(location, 'http://internal.local');

		switch (url.pathname) {
			case '/customers':
				await goto(resolve('/customers'), { invalidateAll: true });
				return;
			case '/dashboard':
				await goto(resolve('/dashboard'), { invalidateAll: true });
				return;
			case '/insights':
				await goto(resolve('/insights'), { invalidateAll: true });
				return;
			case '/products':
				await goto(resolve('/products'), { invalidateAll: true });
				return;
			case '/products/new':
				await goto(resolve('/products/new'), { invalidateAll: true });
				return;
			case '/reports':
				await goto(resolve('/reports'), { invalidateAll: true });
				return;
			case '/settings':
				await goto(resolve('/settings'), { invalidateAll: true });
				return;
			case '/simulations':
				await goto(resolve('/simulations'), { invalidateAll: true });
				return;
			case '/simulations/new':
				await goto(resolve('/simulations/new'), { invalidateAll: true });
				return;
			default: {
				const productId = url.pathname.match(/^\/products\/([^/]+)$/)?.[1];
				if (productId) {
					await goto(resolve('/products/[id]', { id: productId }), { invalidateAll: true });
					return;
				}

				const reportId = url.pathname.match(/^\/reports\/([^/]+)$/)?.[1];
				if (reportId) {
					await goto(resolve('/reports/[id]', { id: reportId }), { invalidateAll: true });
					return;
				}

				const simulationId = url.pathname.match(/^\/simulations\/([^/]+)\/live$/)?.[1];
				if (simulationId) {
					await goto(resolve('/simulations/[id]/live', { id: simulationId }), {
						invalidateAll: true
					});
					return;
				}

				await goto(resolve('/dashboard'), { invalidateAll: true });
			}
		}
	}

	const enhanceLogin: SubmitFunction = () => {
		pending = true;

		return async ({ result, update }) => {
			if (result.type === 'redirect') {
				await navigateToRedirect(result.location);
			} else {
				await update({ reset: false });
			}
			pending = false;
		};
	};
</script>

<form class="mt-7 space-y-5" method="POST" use:enhance={enhanceLogin}>
	<div>
		<label class="mb-2 block text-xs font-semibold text-slate-300" for="login-email">
			Email address
		</label>
		<Input
			autocomplete="email"
			id="login-email"
			name="email"
			placeholder="you@company.com"
			required
			type="email"
			value={email}
		/>
	</div>

	<div>
		<label class="mb-2 block text-xs font-semibold text-slate-300" for="login-password">
			Password
		</label>
		<Input
			autocomplete="current-password"
			id="login-password"
			name="password"
			placeholder="Enter your password"
			required
			type="password"
		/>
	</div>

	{#if error}
		<p
			class="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-xs text-red-200"
			role="alert"
		>
			{error}
		</p>
	{/if}

	<Button class="w-full" disabled={pending} type="submit">
		{#if pending}
			<LoaderCircle aria-hidden="true" class="animate-spin" size={17} />
			Signing in
		{:else}
			<LockKeyhole aria-hidden="true" size={17} />
			Sign in
		{/if}
	</Button>
</form>
