<script lang="ts">
	import { ArrowUp } from 'lucide-svelte';
	import { resolve } from '$app/paths';

	import LogoMark from '$lib/components/layout/LogoMark.svelte';
	import { APP_NAME } from '$lib/constants/app';
	import { footerGroups } from '$lib/features/landing/landing.constants';

	const currentYear = new Date().getFullYear();
</script>

<footer class="border-t border-border/70 bg-ink-925" aria-labelledby="footer-brand">
	<div
		class="mx-auto grid max-w-[88rem] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.35fr_2fr] lg:px-8"
	>
		<div class="max-w-sm">
			<a
				class="inline-flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
				href={resolve('/')}
			>
				<LogoMark />
				<span class="text-base font-bold text-slate-100" id="footer-brand">{APP_NAME}</span>
			</a>
			<p class="mt-4 text-sm leading-6 text-slate-400">
				AI-assisted customer simulation, pricing signals, objection discovery, and structured market
				intelligence for better launch decisions.
			</p>
		</div>

		<div class="grid grid-cols-2 gap-8 sm:grid-cols-3">
			{#each footerGroups as group (group.title)}
				<div>
					<h2 class="text-xs font-bold text-slate-200 uppercase">{group.title}</h2>
					<ul class="mt-4 space-y-3">
						{#each group.links as link (link.label)}
							<li>
								{#if link.href}
									<a
										class="rounded-sm text-sm text-slate-500 transition hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
										href={resolve(link.href)}
									>
										{link.label}
									</a>
								{:else}
									<span class="inline-flex items-center gap-2 text-sm text-slate-600">
										{link.label}
										<span
											class="rounded bg-ink-800 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500"
											>Future</span
										>
									</span>
								{/if}
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</div>

	<div class="border-t border-border/70">
		<div
			class="mx-auto flex max-w-[88rem] flex-col gap-3 px-4 py-5 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"
		>
			<p>© {currentYear} Parallel Market AI. Product preview for demonstration purposes.</p>
			<a
				class="inline-flex items-center gap-2 rounded-sm text-slate-500 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
				href="#top"
			>
				Back to top <ArrowUp aria-hidden="true" size={13} />
			</a>
		</div>
	</div>
</footer>
