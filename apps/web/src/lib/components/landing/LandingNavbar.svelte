<script lang="ts">
	import { ArrowUpRight, Menu, X } from 'lucide-svelte';
	import { resolve } from '$app/paths';

	import LogoMark from '$lib/components/layout/LogoMark.svelte';
	import { APP_NAME } from '$lib/constants/app';
	import { landingNavItems } from '$lib/features/landing/landing.constants';

	let { isAuthenticated }: { isAuthenticated: boolean } = $props();
	let drawer: HTMLElement;
	let menuButton: HTMLButtonElement;

	function closeNavigation(restoreFocus = false): void {
		drawer?.hidePopover();
		if (restoreFocus) requestAnimationFrame(() => menuButton?.focus());
	}
</script>

<header
	class="sticky top-0 z-50 border-b border-white/[0.055] bg-ink-950/82 backdrop-blur-xl supports-[backdrop-filter]:bg-ink-950/72"
>
	<div
		class="mx-auto flex h-16 max-w-[88rem] items-center justify-between px-4 sm:px-6 lg:h-[4.5rem] lg:px-8"
	>
		<a
			aria-label="Parallel Market AI home"
			class="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
			href={resolve('/')}
		>
			<LogoMark />
			<span class="text-sm font-bold text-slate-100 sm:text-base">{APP_NAME}</span>
		</a>

		<nav aria-label="Landing page navigation" class="hidden items-center gap-7 lg:flex">
			{#each landingNavItems as item (item.href)}
				<a
					class="rounded-sm text-sm font-medium text-slate-400 transition hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:ring-offset-4 focus-visible:ring-offset-ink-950"
					href={resolve(item.href)}
				>
					{item.label}
				</a>
			{/each}
		</nav>

		<div class="hidden items-center gap-2 lg:flex">
			{#if !isAuthenticated}
				<a
					class="inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
					href={resolve('/login')}
				>
					Login
				</a>
			{/if}
			<a
				class="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(124,58,237,0.16)] transition hover:bg-brand-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
				href={resolve(isAuthenticated ? '/dashboard' : '/login')}
			>
				{isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
				<ArrowUpRight aria-hidden="true" size={16} />
			</a>
		</div>

		<button
			aria-label="Open landing navigation"
			bind:this={menuButton}
			class="grid h-10 w-10 place-items-center rounded-md border border-border/90 bg-ink-800/75 text-slate-100 transition hover:border-brand-light/50 hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light lg:hidden"
			popovertarget="landing-mobile-navigation"
			type="button"
		>
			<Menu aria-hidden="true" size={19} />
		</button>
	</div>
</header>

<div
	aria-label="Landing mobile navigation"
	bind:this={drawer}
	class="m-0 h-dvh max-h-none w-[min(21rem,88vw)] max-w-none border-0 bg-transparent p-0"
	id="landing-mobile-navigation"
	popover="auto"
>
	<div class="flex h-full flex-col border-r border-border bg-ink-950 p-5 shadow-2xl">
		<div class="flex items-center justify-between border-b border-border/70 pb-5">
			<div class="flex items-center gap-3">
				<LogoMark />
				<span class="text-sm font-bold text-slate-100">{APP_NAME}</span>
			</div>
			<button
				aria-label="Close landing navigation"
				class="grid h-9 w-9 place-items-center rounded-md border border-border text-slate-300 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
				onclick={() => closeNavigation(true)}
				type="button"
			>
				<X aria-hidden="true" size={18} />
			</button>
		</div>

		<nav aria-label="Landing mobile links" class="mt-6 space-y-1.5">
			{#each landingNavItems as item (item.href)}
				<a
					class="flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
					href={resolve(item.href)}
					onclick={() => closeNavigation()}
				>
					{item.label}
				</a>
			{/each}
		</nav>

		<div class="mt-auto grid gap-3 border-t border-border/70 pt-5">
			{#if !isAuthenticated}
				<a
					class="inline-flex h-11 items-center justify-center rounded-md border border-border bg-ink-800 text-sm font-semibold text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
					href={resolve('/login')}
					onclick={() => closeNavigation()}
				>
					Login
				</a>
			{/if}
			<a
				class="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
				href={resolve(isAuthenticated ? '/dashboard' : '/login')}
				onclick={() => closeNavigation()}
			>
				{isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
				<ArrowUpRight aria-hidden="true" size={16} />
			</a>
		</div>
	</div>
</div>

<style>
	#landing-mobile-navigation:popover-open {
		inset: 0 auto 0 0;
	}

	#landing-mobile-navigation::backdrop {
		background: rgb(0 0 0 / 70%);
		backdrop-filter: blur(4px);
	}
</style>
