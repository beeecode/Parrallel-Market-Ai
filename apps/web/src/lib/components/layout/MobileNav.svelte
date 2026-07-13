<script lang="ts">
	import { Menu, X } from 'lucide-svelte';
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';

	import LogoMark from '$lib/components/layout/LogoMark.svelte';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import { APP_NAME } from '$lib/constants/app';
	import type { AuthenticatedUser } from '$lib/types/auth';

	let { activePath, user }: { activePath: string; user: AuthenticatedUser } = $props();
	let drawer: HTMLElement;
	let menuButton: HTMLButtonElement;
	let restoreMenuFocus = false;

	function closeNavigation(): void {
		restoreMenuFocus = true;
		drawer?.hidePopover();
	}

	afterNavigate(() => {
		if (!restoreMenuFocus) return;

		restoreMenuFocus = false;
		requestAnimationFrame(() => menuButton?.focus());
	});
</script>

<header
	class="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border/90 bg-ink-950/92 px-4 backdrop-blur-xl lg:hidden"
>
	<a class="flex items-center gap-3" href={resolve('/dashboard')}>
		<LogoMark />
		<span class="text-sm font-bold text-slate-100">{APP_NAME}</span>
	</a>
	<button
		aria-label="Open navigation menu"
		bind:this={menuButton}
		class="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border bg-ink-800/70 text-slate-100 transition hover:border-brand-light/55 hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
		popovertarget="mobile-navigation-drawer"
		type="button"
	>
		<Menu aria-hidden="true" size={19} />
	</button>
</header>

<div
	aria-label="Mobile navigation drawer"
	bind:this={drawer}
	class="m-0 h-dvh max-h-none w-[min(20rem,86vw)] max-w-none border-0 bg-transparent p-0"
	id="mobile-navigation-drawer"
	popover="auto"
>
	<div class="relative h-full">
		<button
			aria-label="Close navigation menu"
			class="absolute top-5 right-4 z-10 grid h-9 w-9 place-items-center rounded-md border border-border bg-ink-800 text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
			popovertarget="mobile-navigation-drawer"
			popovertargetaction="hide"
			type="button"
		>
			<X aria-hidden="true" size={18} />
		</button>
		<Sidebar {activePath} onnavigate={closeNavigation} {user} />
	</div>
</div>

<style>
	#mobile-navigation-drawer:popover-open {
		inset: 0 auto 0 0;
	}

	#mobile-navigation-drawer::backdrop {
		background: rgb(0 0 0 / 68%);
		backdrop-filter: blur(4px);
	}
</style>
