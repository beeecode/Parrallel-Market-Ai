<script lang="ts">
	import { LogOut } from 'lucide-svelte';
	import { resolve } from '$app/paths';

	import LogoMark from '$lib/components/layout/LogoMark.svelte';
	import { APP_NAME } from '$lib/constants/app';
	import { navigationItems } from '$lib/constants/navigation';
	import type { AuthenticatedUser } from '$lib/types/auth';

	let {
		activePath,
		onnavigate,
		user
	}: {
		activePath: string;
		onnavigate?: () => void;
		user: AuthenticatedUser;
	} = $props();

	function isActive(href: string): boolean {
		return activePath === href || activePath.startsWith(`${href}/`);
	}

	function roleLabel(role: AuthenticatedUser['role']): string {
		return role
			.split('-')
			.map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
			.join(' ');
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
					href={resolve(item.href)}
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
				alt={`${user.name} avatar`}
				class="h-10 w-10 rounded-full border border-border bg-ink-800 object-cover"
				height="40"
				src={user.avatarUrl || '/assets/2d/avatars/person.svg'}
				width="40"
			/>
			<div class="min-w-0 flex-1">
				<p class="truncate text-sm font-semibold text-slate-100">{user.name}</p>
				<p class="truncate text-xs text-slate-500">{roleLabel(user.role)}</p>
			</div>
			<form action={resolve('/logout')} method="POST">
				<button
					aria-label="Sign out"
					class="grid h-8 w-8 place-items-center rounded-md text-slate-500 transition hover:bg-white/5 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
					type="submit"
				>
					<LogOut aria-hidden="true" size={16} />
				</button>
			</form>
		</div>
	</div>
</aside>
