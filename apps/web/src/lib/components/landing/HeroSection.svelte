<script lang="ts">
	import { ArrowRight, Check, MessageCircleMore, Play, TrendingUp } from 'lucide-svelte';
	import { resolve } from '$app/paths';

	let { isAuthenticated }: { isAuthenticated: boolean } = $props();

	const valueChips = [
		'Customer personas',
		'Pricing insights',
		'Objection discovery',
		'Market reports'
	] as const;
</script>

<section
	class="relative overflow-hidden border-b border-border/55"
	aria-labelledby="landing-hero-title"
>
	<div
		class="landing-grid pointer-events-none absolute inset-0 opacity-40"
		aria-hidden="true"
	></div>
	<div
		class="pointer-events-none absolute inset-x-[15%] top-32 h-72 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.14),transparent_68%)]"
		aria-hidden="true"
	></div>

	<div
		class="relative mx-auto max-w-[88rem] px-4 pt-10 pb-8 sm:px-6 sm:pt-16 sm:pb-10 lg:px-8 lg:pb-8"
	>
		<div class="mx-auto max-w-4xl text-center">
			<div
				class="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-light/30 bg-brand/10 px-3 py-1.5 text-xs font-semibold text-purple-200"
			>
				<span class="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true"></span>
				AI-assisted market simulation platform
			</div>

			<h1
				id="landing-hero-title"
				class="mx-auto max-w-4xl text-[clamp(2.4rem,7vw,4.75rem)] leading-[1.02] font-bold text-balance text-slate-50"
			>
				Simulate your market <span class="text-brand-light">before you launch</span>
			</h1>
			<p class="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
				Explore customer reactions, pricing signals, objections, and structured market reports
				before committing more time and budget to a launch.
			</p>

			<div class="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
				<a
					class="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brand px-5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(124,58,237,0.2)] transition hover:bg-brand-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
					href={resolve(isAuthenticated ? '/dashboard' : '/login')}
				>
					{isAuthenticated ? 'Go to Dashboard' : 'Start Simulating'}
					<ArrowRight aria-hidden="true" size={17} />
				</a>
				<a
					class="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border bg-ink-850/80 px-5 text-sm font-semibold text-slate-100 transition hover:border-brand-light/45 hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
					href="#showcase"
				>
					<Play aria-hidden="true" fill="currentColor" size={15} />
					View Product Demo
				</a>
			</div>

			<ul
				class="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2"
				aria-label="Platform capabilities"
			>
				{#each valueChips as chip (chip)}
					<li class="flex items-center gap-1.5 text-xs text-slate-400 sm:text-sm">
						<Check aria-hidden="true" class="text-success" size={14} strokeWidth={2.2} />
						{chip}
					</li>
				{/each}
			</ul>
		</div>

		<div
			class="relative mx-auto mt-10 max-h-32 max-w-5xl overflow-hidden sm:max-h-none sm:overflow-visible"
			aria-label="Parallel Market AI product preview"
		>
			<div
				class="overflow-hidden rounded-lg border border-border bg-ink-925/95 shadow-[0_24px_70px_rgba(0,0,0,0.32)]"
			>
				<div class="flex h-11 items-center justify-between border-b border-border/80 px-4">
					<div class="flex items-center gap-2" aria-hidden="true">
						<span class="h-2 w-2 rounded-full bg-danger/70"></span>
						<span class="h-2 w-2 rounded-full bg-warning/70"></span>
						<span class="h-2 w-2 rounded-full bg-success/70"></span>
					</div>
					<span class="text-[11px] font-medium text-slate-500">Market simulation overview</span>
					<span class="rounded bg-success/10 px-2 py-1 text-[10px] font-semibold text-green-300"
						>Demo</span
					>
				</div>

				<div class="grid gap-px bg-border/70 md:grid-cols-[1.22fr_0.78fr]">
					<div class="grid min-h-52 gap-px bg-border/70 sm:grid-cols-2">
						<div class="bg-ink-850 p-5 sm:p-6">
							<div class="flex items-start justify-between gap-3">
								<div>
									<p class="text-xs font-medium text-slate-400">Success probability</p>
									<p class="mt-2 text-3xl font-bold text-slate-50">72%</p>
								</div>
								<div
									class="grid h-12 w-12 place-items-center rounded-full border-[5px] border-brand border-l-success text-[10px] font-bold text-slate-100"
									aria-hidden="true"
								>
									72
								</div>
							</div>
							<div class="mt-8 flex h-12 items-end gap-1" aria-hidden="true">
								{#each [34, 48, 43, 61, 58, 72, 67, 82] as height, index (index)}
									<span
										class={['flex-1 rounded-t-sm', index > 5 ? 'bg-success/65' : 'bg-brand/65']}
										style={`height: ${height}%`}
									></span>
								{/each}
							</div>
						</div>

						<div class="hidden bg-ink-850 p-6 sm:block">
							<div class="flex items-center justify-between">
								<div>
									<p class="text-xs font-medium text-slate-400">Revenue forecast</p>
									<p class="mt-2 text-lg font-bold text-brand-light">₦4.2M – ₦6.8M</p>
								</div>
								<TrendingUp aria-hidden="true" class="text-success" size={20} />
							</div>
							<svg
								aria-label="Sample revenue forecast trending upward"
								class="mt-7 h-20 w-full"
								role="img"
								viewBox="0 0 220 80"
							>
								<path
									d="M2 67 L35 51 L67 59 L102 32 L135 47 L171 23 L218 9"
									fill="none"
									stroke="#a855f7"
									stroke-linecap="round"
									stroke-width="3"
								/>
								<path
									d="M2 67 L35 51 L67 59 L102 32 L135 47 L171 23 L218 9 L218 80 L2 80 Z"
									fill="url(#hero-chart-fill)"
									opacity="0.58"
								/>
								<defs>
									<linearGradient id="hero-chart-fill" x1="0" x2="0" y1="0" y2="1">
										<stop offset="0" stop-color="#7c3aed" stop-opacity="0.45" />
										<stop offset="1" stop-color="#7c3aed" stop-opacity="0" />
									</linearGradient>
								</defs>
							</svg>
						</div>
					</div>

					<div class="hidden bg-ink-900 p-5 md:block">
						<div class="flex items-center gap-2 border-b border-border/70 pb-3">
							<MessageCircleMore aria-hidden="true" class="text-brand-light" size={17} />
							<p class="text-xs font-semibold text-slate-200">Customer signal</p>
						</div>
						<div class="mt-4 space-y-3">
							<div
								class="max-w-[85%] rounded-md rounded-tl-none bg-slate-100 p-3 text-xs leading-5 text-slate-800"
							>
								The delivery fee feels high. Is there a pickup option?
							</div>
							<div
								class="ml-auto max-w-[84%] rounded-md rounded-tr-none bg-emerald-900/80 p-3 text-xs leading-5 text-emerald-50"
							>
								Yes. Pickup removes the delivery fee and takes about 15 minutes.
							</div>
							<div
								class="flex items-center justify-between rounded-md border border-border bg-ink-850 px-3 py-2.5"
							>
								<span class="text-[11px] text-slate-400">Sentiment</span>
								<span class="text-xs font-semibold text-green-300">Positive · 49%</span>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div
				class="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-ink-950 to-transparent sm:hidden"
				aria-hidden="true"
			></div>
		</div>
	</div>
</section>

<style>
	.landing-grid {
		background-image:
			linear-gradient(rgb(148 163 184 / 0.055) 1px, transparent 1px),
			linear-gradient(90deg, rgb(148 163 184 / 0.055) 1px, transparent 1px);
		background-size: 42px 42px;
		mask-image: linear-gradient(to bottom, black, transparent 88%);
	}
</style>
