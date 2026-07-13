<script lang="ts">
	import LandingIcon from './LandingIcon.svelte';
	import { featureItems } from '$lib/features/landing/landing.constants';
</script>

<section aria-labelledby="features-title" class="scroll-mt-20 py-20 sm:py-24" id="features">
	<div class="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
		<div class="max-w-2xl">
			<p class="text-sm font-semibold text-brand-light">One workspace, clearer market questions</p>
			<h2 id="features-title" class="mt-3 text-3xl font-bold text-slate-50 sm:text-4xl">
				Explore the decisions behind a stronger launch
			</h2>
			<p class="mt-4 text-base leading-7 text-slate-400">
				Move from an early product idea to structured customer, pricing, and risk insights without
				losing the context behind them.
			</p>
		</div>

		<div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each featureItems as feature (feature.title)}
				<article
					class="group min-h-56 rounded-lg border border-border/90 bg-ink-850/78 p-6 transition duration-200 hover:-translate-y-0.5 hover:border-brand-light/35 hover:bg-ink-850 focus-within:border-brand-light/35"
				>
					<div
						class="grid h-11 w-11 place-items-center rounded-md border border-brand-light/25 bg-brand/10 text-brand-light transition group-hover:border-brand-light/45 group-hover:bg-brand/15"
					>
						<LandingIcon name={feature.icon} size={21} />
					</div>
					<h3 class="mt-7 text-lg font-bold text-slate-100">{feature.title}</h3>
					<p class="mt-3 text-sm leading-6 text-slate-400">{feature.description}</p>
				</article>
			{/each}
		</div>
	</div>
</section>
