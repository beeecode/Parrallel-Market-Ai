<script lang="ts">
	import {
		ArrowUpRight,
		Check,
		Clock3,
		MessageCircleMore,
		ShieldCheck,
		Sparkles,
		TrendingUp
	} from 'lucide-svelte';
	import { resolve } from '$app/paths';

	import { showcaseTabs } from '$lib/features/landing/landing.constants';
	import type { ShowcaseTabId } from '$lib/features/landing/landing.types';

	let activeId: ShowcaseTabId = $state('dashboard');
	let activeTab = $derived(showcaseTabs.find((tab) => tab.id === activeId) ?? showcaseTabs[0]);
</script>

<section aria-labelledby="showcase-title" class="scroll-mt-20 py-20 sm:py-24" id="showcase">
	<div class="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
		<div class="max-w-2xl">
			<p class="text-sm font-semibold text-brand-light">Inside the product</p>
			<h2 id="showcase-title" class="mt-3 text-3xl font-bold text-slate-50 sm:text-4xl">
				See the signal, context, and next step together
			</h2>
			<p class="mt-4 text-base leading-7 text-slate-400">
				Explore static previews of the core workspace. No private customer or Payload data is used
				on this page.
			</p>
		</div>

		<div class="mt-10 overflow-hidden rounded-lg border border-border bg-ink-925/90">
			<div
				aria-label="Product preview modules"
				class="flex gap-1 overflow-x-auto border-b border-border bg-ink-950/60 p-2"
				role="tablist"
			>
				{#each showcaseTabs as tab (tab.id)}
					<button
						aria-controls="product-showcase-panel"
						aria-selected={activeId === tab.id}
						id={`showcase-tab-${tab.id}`}
						class={[
							'inline-flex h-10 shrink-0 items-center justify-center rounded-md px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light',
							activeId === tab.id
								? 'bg-brand text-white'
								: 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
						]}
						onclick={() => (activeId = tab.id)}
						role="tab"
						type="button"
					>
						{tab.label}
					</button>
				{/each}
			</div>

			<div
				aria-labelledby={`showcase-tab-${activeId}`}
				class="grid min-h-[34rem] lg:grid-cols-[0.72fr_1.28fr]"
				id="product-showcase-panel"
				role="tabpanel"
			>
				<div
					class="flex flex-col justify-center border-b border-border p-6 sm:p-8 lg:border-r lg:border-b-0 lg:p-10"
				>
					<span class="text-xs font-semibold text-green-300 uppercase">Product preview</span>
					<h3 class="mt-4 text-2xl font-bold text-slate-50 sm:text-3xl">{activeTab.title}</h3>
					<p class="mt-4 text-sm leading-7 text-slate-400 sm:text-base">{activeTab.description}</p>
					<ul class="mt-7 space-y-3">
						{#each activeTab.highlights as highlight (highlight)}
							<li class="flex items-center gap-3 text-sm text-slate-300">
								<span
									class="grid h-6 w-6 place-items-center rounded-full bg-success/10 text-green-300"
								>
									<Check aria-hidden="true" size={13} strokeWidth={2.4} />
								</span>
								{highlight}
							</li>
						{/each}
					</ul>
					<a
						class="mt-8 inline-flex w-fit items-center gap-2 rounded-sm text-sm font-semibold text-brand-light hover:text-purple-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
						href={resolve('/login')}
					>
						Explore the workspace <ArrowUpRight aria-hidden="true" size={16} />
					</a>
				</div>

				<div class="min-w-0 bg-ink-950/50 p-4 sm:p-7 lg:p-9">
					<div
						class="h-full min-h-[25rem] overflow-hidden rounded-lg border border-border bg-ink-900 shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
					>
						{#if activeId === 'dashboard'}
							<div class="flex items-center justify-between border-b border-border p-4">
								<div>
									<p class="text-sm font-bold text-slate-100">Dashboard</p>
									<p class="mt-1 text-[11px] text-slate-500">Simulation performance overview</p>
								</div>
								<span
									class="rounded bg-brand/15 px-2 py-1 text-[10px] font-semibold text-purple-200"
									>Sample</span
								>
							</div>
							<div class="grid gap-3 p-4 sm:grid-cols-2">
								<div class="rounded-md border border-border bg-ink-850 p-4">
									<div class="flex items-center justify-between">
										<p class="text-xs text-slate-400">Launch confidence</p>
										<ShieldCheck aria-hidden="true" class="text-success" size={17} />
									</div>
									<div class="mt-5 flex items-center gap-4">
										<div
											class="grid h-20 w-20 place-items-center rounded-full border-[8px] border-brand border-l-success text-xl font-bold"
										>
											72%
										</div>
										<p class="text-xs leading-5 text-slate-400">
											Viable with targeted improvements
										</p>
									</div>
								</div>
								<div class="rounded-md border border-border bg-ink-850 p-4">
									<p class="text-xs text-slate-400">Revenue forecast</p>
									<p class="mt-2 text-xl font-bold text-brand-light">₦4.2M – ₦6.8M</p>
									<div class="mt-7 flex h-16 items-end gap-1" aria-hidden="true">
										{#each [22, 36, 30, 51, 44, 63, 56, 76, 92] as height, index (index)}
											<span class="flex-1 rounded-t-sm bg-brand/70" style={`height: ${height}%`}
											></span>
										{/each}
									</div>
								</div>
							</div>
							<div class="grid grid-cols-2 gap-3 px-4 pb-4 sm:grid-cols-4">
								{#each [['Customers', '1,000'], ['Conversations', '3,842'], ['Purchase rate', '23.7%'], ['Repeat rate', '11.3%']] as metric (metric[0])}
									<div class="rounded-md border border-border bg-ink-850 p-3">
										<p class="text-[10px] text-slate-500">{metric[0]}</p>
										<p class="mt-1 text-sm font-bold text-slate-100">{metric[1]}</p>
									</div>
								{/each}
							</div>
						{:else if activeId === 'simulation'}
							<div class="flex items-center justify-between border-b border-border p-4">
								<div class="flex items-center gap-2">
									<MessageCircleMore aria-hidden="true" class="text-brand-light" size={17} />
									<p class="text-sm font-bold text-slate-100">Live Simulation</p>
								</div>
								<span class="flex items-center gap-1.5 text-[11px] text-green-300"
									><span class="h-1.5 w-1.5 rounded-full bg-success"></span> Running</span
								>
							</div>
							<div class="grid min-h-[21rem] sm:grid-cols-[0.38fr_0.62fr]">
								<div class="hidden border-r border-border p-3 sm:block">
									{#each ['Tunde', 'Bola', 'Ada', 'Zainab'] as name, index (name)}
										<div
											class={[
												'mb-2 flex items-center gap-2 rounded-md p-2.5',
												index === 0 ? 'bg-brand/12' : ''
											]}
										>
											<span
												class="grid h-7 w-7 place-items-center rounded-full bg-ink-700 text-[10px] font-bold text-slate-300"
												>{name[0]}</span
											>
											<div>
												<p class="text-xs font-semibold text-slate-200">{name}</p>
												<p class="text-[9px] text-slate-500">Customer persona</p>
											</div>
										</div>
									{/each}
								</div>
								<div class="flex flex-col justify-end gap-3 p-4">
									<div
										class="max-w-[82%] rounded-md rounded-bl-none bg-slate-100 p-3 text-xs leading-5 text-slate-800"
									>
										Is delivery available to Yaba, and what does it cost?
									</div>
									<div
										class="ml-auto max-w-[82%] rounded-md rounded-br-none bg-emerald-900 p-3 text-xs leading-5 text-emerald-50"
									>
										Yes. Delivery is available, and pickup is free if you prefer.
									</div>
									<div
										class="max-w-[82%] rounded-md rounded-bl-none bg-slate-100 p-3 text-xs leading-5 text-slate-800"
									>
										That helps. Do you have a smaller meal option?
									</div>
									<div
										class="mt-3 flex items-center justify-between rounded-md border border-border bg-ink-850 px-3 py-2.5 text-[11px] text-slate-500"
									>
										<span>Type a reply...</span><span
											class="grid h-7 w-7 place-items-center rounded-md bg-brand text-white">→</span
										>
									</div>
								</div>
							</div>
						{:else if activeId === 'report'}
							<div class="flex items-center justify-between border-b border-border p-4">
								<p class="text-sm font-bold text-slate-100">Simulation Report</p>
								<span class="text-[11px] text-slate-500">Overview</span>
							</div>
							<div class="grid gap-3 p-4 sm:grid-cols-2">
								<div class="rounded-md border border-border bg-ink-850 p-4">
									<p class="text-xs text-slate-400">Customer sentiment</p>
									<div class="mt-5 flex items-center gap-5">
										<div
											class="h-20 w-20 rounded-full"
											style="background: conic-gradient(#22c55e 0 49%, #facc15 49% 77%, #ef4444 77% 100%); mask: radial-gradient(circle at center, transparent 0 45%, #000 47%);"
										></div>
										<div class="space-y-2 text-[11px]">
											<p class="text-green-300">Positive 49%</p>
											<p class="text-yellow-200">Neutral 28%</p>
											<p class="text-red-300">Negative 23%</p>
										</div>
									</div>
								</div>
								<div class="rounded-md border border-border bg-ink-850 p-4">
									<p class="text-xs text-slate-400">Top objection</p>
									<p class="mt-3 text-base font-bold text-slate-100">Delivery fee is too high</p>
									<div class="mt-5 h-2 overflow-hidden rounded-full bg-ink-700">
										<div class="h-full w-[68%] bg-danger/75"></div>
									</div>
									<p class="mt-2 text-[10px] text-slate-500">Appears across multiple personas</p>
								</div>
								<div class="rounded-md border border-border bg-ink-850 p-4 sm:col-span-2">
									<div class="flex items-center justify-between">
										<div>
											<p class="text-xs text-slate-400">Optimal price range</p>
											<p class="mt-1 text-lg font-bold text-green-300">₦3,200 – ₦3,800</p>
										</div>
										<TrendingUp aria-hidden="true" class="text-success" size={20} />
									</div>
									<svg
										aria-label="Sample price demand curve"
										class="mt-3 h-16 w-full"
										role="img"
										viewBox="0 0 300 70"
										><path
											d="M4 61 C58 58 87 47 127 19 C154 1 178 11 198 30 C221 51 248 58 296 61"
											fill="none"
											stroke="#86efac"
											stroke-width="2.5"
										/><path
											d="M162 8 V64"
											stroke="#22c55e"
											stroke-dasharray="3 4"
											opacity="0.6"
										/></svg
									>
								</div>
							</div>
						{:else}
							<div class="flex items-center justify-between border-b border-border p-4">
								<div class="flex items-center gap-2">
									<Sparkles aria-hidden="true" class="text-brand-light" size={17} />
									<p class="text-sm font-bold text-slate-100">Request Simulation</p>
								</div>
								<span class="text-[11px] text-slate-500">Step 6 of 15</span>
							</div>
							<div class="p-5 sm:p-7">
								<div class="h-1.5 overflow-hidden rounded-full bg-ink-700">
									<div class="h-full w-[40%] rounded-full bg-brand"></div>
								</div>
								<div class="mt-7 flex gap-3">
									<span
										class="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-brand/15 text-brand-light"
										><Sparkles aria-hidden="true" size={17} /></span
									>
									<div class="rounded-md rounded-tl-none border border-border bg-ink-850 p-4">
										<p class="text-xs font-semibold text-purple-200">Simulation brief assistant</p>
										<p class="mt-2 text-sm leading-6 text-slate-200">
											Who are the customers you want this market simulation to focus on?
										</p>
									</div>
								</div>
								<div
									class="mt-5 ml-auto max-w-[82%] rounded-md rounded-tr-none bg-brand p-4 text-sm leading-6 text-white"
								>
									Busy professionals and students ordering affordable lunch in Lagos.
								</div>
								<div class="mt-8 rounded-md border border-border bg-ink-850 p-4">
									<div class="flex items-center justify-between">
										<span class="text-xs font-semibold text-slate-300">Current brief</span><Clock3
											aria-hidden="true"
											class="text-slate-500"
											size={15}
										/>
									</div>
									<div class="mt-3 grid gap-2 text-[11px] text-slate-400 sm:grid-cols-2">
										<span class="rounded bg-ink-900 p-2">Product: Shawarma menu</span><span
											class="rounded bg-ink-900 p-2">Market: Lagos</span
										><span class="rounded bg-ink-900 p-2">Goal: Pricing validation</span><span
											class="rounded bg-ink-900 p-2">Status: In progress</span
										>
									</div>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
