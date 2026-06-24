<script lang="ts">
	import { resolve } from '$app/paths';
	import type { RouteId } from '$app/types';

	import LogoMark from '$lib/components/layout/LogoMark.svelte';
	import { APP_NAME, USER_PROFILE } from '$lib/constants/app';
	import { navigationItems } from '$lib/constants/navigation';

	let {
		activePath,
		onnavigate
	}: {
		activePath: string;
		onnavigate?: () => void;
	} = $props();

	function isActive(href: string): boolean {
		return activePath === href || activePath.startsWith(`${href}/`);
	}
</script>

<aside
	class="flex h-full flex-col border-r border-border/90 bg-ink-950/94 px-4 py-5 backdrop-blur-xl"
>
	<a
		class="mb-8 flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
		href={resolve('/dashboard')}
		onclick={onnavigate}
	>
		<LogoMark />
		<span class="text-sm font-bold tracking-tight text-slate-100">{APP_NAME}</span>
	</a>

	<nav aria-label="Primary navigation" class="space-y-1.5">
		{#each navigationItems as item (item.label)}
			{@const Icon = item.icon}
			{#if item.disabled}
				<span
					aria-disabled="true"
					class="flex min-h-10 cursor-not-allowed items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-500 opacity-65"
				>
					<Icon aria-hidden="true" size={18} strokeWidth={1.8} />
					{item.label}
				</span>
			{:else}
				<a
					aria-current={isActive(item.href) ? 'page' : undefined}
					class={[
						'group flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950',
						isActive(item.href)
							? 'bg-brand text-white shadow-[0_4px_12px_rgba(124,58,237,0.12)]'
							: 'text-slate-400 hover:bg-white/[0.045] hover:text-slate-100'
					]}
					href={resolve(item.href as RouteId)}
					onclick={onnavigate}
				>
					<Icon aria-hidden="true" size={18} strokeWidth={1.8} />
					{item.label}
				</a>
			{/if}
		{/each}
	</nav>

	<div class="mt-auto border-t border-border/70 pt-4">
		<div class="flex items-center gap-3 rounded-lg border border-border/85 bg-ink-900/55 p-3">
			<img
				alt={`${USER_PROFILE.name} avatar`}
				class="h-10 w-10 rounded-full border border-border bg-ink-800 object-cover"
				height="40"
				src={USER_PROFILE.avatar}
				width="40"
			/>
			<div class="min-w-0">
				<p class="truncate text-sm font-semibold text-slate-100">{USER_PROFILE.name}</p>
				<p class="text-xs text-slate-500">{USER_PROFILE.plan}</p>
			</div>
		</div>
	</div>
</aside>
