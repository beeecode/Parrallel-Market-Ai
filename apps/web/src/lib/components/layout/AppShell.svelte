<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';

	import MobileNav from '$lib/components/layout/MobileNav.svelte';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="min-h-screen overflow-x-hidden bg-transparent text-slate-100">
	<MobileNav activePath={page.url.pathname} />

	<div class="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
		<Sidebar activePath={page.url.pathname} />
	</div>

	<main class="min-w-0 px-4 py-6 sm:px-6 lg:ml-64 lg:px-8 lg:py-8">
		<div class="mx-auto w-full max-w-[88rem] min-w-0">
			{@render children()}
		</div>
	</main>
</div>
