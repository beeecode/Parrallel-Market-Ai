<script lang="ts">
	import { ArrowRight } from 'lucide-svelte';

	import LandingIcon from './LandingIcon.svelte';
	import { benefitItems } from '$lib/features/landing/landing.constants';
</script>

<section
	aria-labelledby="benefits-title"
	class="border-y border-border/55 bg-ink-925/68 py-20 sm:py-24"
>
	<div class="mx-auto grid max-w-[88rem] gap-12 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
		<div class="lg:sticky lg:top-28 lg:self-start">
			<p class="text-sm font-semibold text-green-300">Built for better decisions</p>
			<h2 id="benefits-title" class="mt-3 text-3xl font-bold text-slate-50 sm:text-4xl">
				Spend more confidently after you test the assumptions
			</h2>
			<p class="mt-5 max-w-xl text-base leading-7 text-slate-400">
				Parallel Market AI helps your team replace scattered launch opinions with a structured view
				of the questions, signals, and risks that matter.
			</p>
			<a
				class="mt-7 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-brand-light transition hover:text-purple-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
				href="#use-cases"
			>
				Explore practical use cases <ArrowRight aria-hidden="true" size={16} />
			</a>
		</div>

		<div
			class="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2"
		>
			{#each benefitItems as benefit (benefit.title)}
				<article class="bg-ink-850 p-6 transition hover:bg-ink-800/95">
					<div class="flex items-start gap-4">
						<span
							class="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-success/10 text-green-300"
						>
							<LandingIcon name={benefit.icon} size={19} />
						</span>
						<div>
							<h3 class="text-base font-bold text-slate-100">{benefit.title}</h3>
							<p class="mt-2 text-sm leading-6 text-slate-400">{benefit.description}</p>
						</div>
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>
