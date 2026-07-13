<script lang="ts">
	import type { Snippet } from 'svelte';
	import { navigating, page } from '$app/state';

	import MobileNav from '$lib/components/layout/MobileNav.svelte';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import type { AuthenticatedUser } from '$lib/types/auth';

	let { children, user }: { children: Snippet; user: AuthenticatedUser } = $props();
</script>

<div class="min-h-screen overflow-x-hidden bg-transparent text-slate-100">
	{#if navigating.to}
		<div
			aria-label="Loading page"
			class="fixed inset-x-0 top-0 z-[70] h-0.5 overflow-hidden bg-brand/20"
			role="progressbar"
		>
			<div class="h-full w-2/5 animate-pulse bg-brand-light"></div>
		</div>
	{/if}

	<MobileNav activePath={page.url.pathname} {user} />

	<div class="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
		<Sidebar activePath={page.url.pathname} {user} />
	</div>

	<main class="min-w-0 px-4 py-6 sm:px-6 lg:ml-64 lg:px-8 lg:py-8">
		<div class="mx-auto w-full max-w-[88rem] min-w-0">
			{@render children()}
		</div>
	</main>
</div>
