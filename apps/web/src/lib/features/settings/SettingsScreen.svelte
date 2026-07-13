<script lang="ts">
	import { LogOut, Lock, UserRound } from 'lucide-svelte';
	import { resolve } from '$app/paths';

	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import type { SettingsViewModel } from '$lib/types/settings';

	let { settings }: { settings: SettingsViewModel } = $props();
</script>

<div>
	<PageHeader subtitle="Account profile and workspace preferences" title="Settings" />

	<div class="grid gap-5 xl:grid-cols-[24rem_minmax(0,1fr)]">
		<Card class="h-fit p-5">
			<div class="flex items-center gap-4">
				<img
					alt={`${settings.profile.name} avatar`}
					class="h-16 w-16 rounded-full border border-border bg-ink-800 object-cover"
					height="64"
					src={settings.profile.avatarUrl || '/assets/2d/avatars/person.svg'}
					width="64"
				/>
				<div class="min-w-0">
					<h2 class="truncate text-lg font-bold text-slate-50">{settings.profile.name}</h2>
					<p class="mt-1 truncate text-sm text-slate-400">{settings.profile.email}</p>
				</div>
			</div>
			<dl class="mt-5 space-y-4 text-sm">
				<div>
					<dt class="text-xs text-slate-500">Role</dt>
					<dd class="mt-1 text-slate-100">{settings.profile.roleLabel}</dd>
				</div>
				<div>
					<dt class="text-xs text-slate-500">Company</dt>
					<dd class="mt-1 text-slate-100">{settings.profile.company}</dd>
				</div>
			</dl>
			<form action={resolve('/logout')} class="mt-6" method="POST">
				<Button type="submit" variant="secondary">
					<LogOut aria-hidden="true" size={16} />
					Logout
				</Button>
			</form>
		</Card>

		<div class="space-y-5">
			<Card class="p-5">
				<div class="flex items-center gap-3">
					<div
						class="grid h-10 w-10 place-items-center rounded-md border border-border bg-ink-950/55 text-brand-light"
					>
						<UserRound aria-hidden="true" size={18} />
					</div>
					<div>
						<h2 class="text-sm font-semibold text-slate-100">Account information</h2>
						<p class="mt-1 text-xs text-slate-500">
							Profile details are managed through Payload CMS.
						</p>
					</div>
				</div>
			</Card>

			<div class="grid gap-4 md:grid-cols-2">
				{#each settings.sections as section (section.id)}
					<Card class="p-5">
						<div class="flex items-start justify-between gap-3">
							<div
								class="grid h-10 w-10 place-items-center rounded-md border border-border bg-ink-950/55 text-slate-300"
							>
								<Lock aria-hidden="true" size={17} />
							</div>
							<Badge tone={section.status === 'available' ? 'success' : 'neutral'}>
								{section.status === 'available' ? 'Active' : 'Future'}
							</Badge>
						</div>
						<h3 class="mt-5 text-sm font-semibold text-slate-100">{section.title}</h3>
						<p class="mt-2 text-sm leading-6 text-slate-400">{section.description}</p>
					</Card>
				{/each}
			</div>
		</div>
	</div>
</div>
