<script lang="ts">
	import { ArrowUpRight } from 'lucide-svelte';

	import LandingIcon from './LandingIcon.svelte';
	import { useCaseItems } from '$lib/features/landing/landing.constants';
</script>

<section aria-labelledby="use-cases-title" class="scroll-mt-20 py-20 sm:py-24" id="use-cases">
	<div class="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
		<div class="max-w-2xl">
			<p class="text-sm font-semibold text-brand-light">Use cases, not empty promises</p>
			<h2 id="use-cases-title" class="mt-3 text-3xl font-bold text-slate-50 sm:text-4xl">
				Bring structure to real market decisions
			</h2>
			<p class="mt-4 text-base leading-7 text-slate-400">
				Each scenario begins with a practical business question and ends with findings that still
				need thoughtful real-world validation.
			</p>
		</div>

		<div class="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
			{#each useCaseItems as useCase (useCase.title)}
				<article
					class="group rounded-lg border border-border bg-ink-850/78 p-6 transition hover:-translate-y-0.5 hover:border-brand-light/35 hover:bg-ink-850"
				>
					<div class="flex items-start justify-between gap-4">
						<span
							class="grid h-10 w-10 place-items-center rounded-md border border-border bg-ink-900 text-brand-light"
						>
							<LandingIcon name={useCase.icon} size={19} />
						</span>
						<ArrowUpRight
							aria-hidden="true"
							class="text-slate-600 transition group-hover:text-brand-light"
							size={17}
						/>
					</div>
					<h3 class="mt-6 text-base font-bold text-slate-100">{useCase.title}</h3>
					<p class="mt-3 text-sm leading-6 text-slate-400">{useCase.description}</p>
					<p class="mt-5 border-t border-border/70 pt-4 text-xs leading-5 text-green-300">
						{useCase.insight}
					</p>
				</article>
			{/each}
		</div>
	</div>
</section>
