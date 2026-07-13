<script lang="ts">
	import { ArrowDown, ArrowRight } from 'lucide-svelte';

	import { workflowSteps } from '$lib/features/landing/landing.constants';
</script>

<section
	aria-labelledby="workflow-title"
	class="scroll-mt-20 border-y border-border/55 bg-ink-925/68 py-20 sm:py-24"
	id="how-it-works"
>
	<div class="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-2xl text-center">
			<p class="text-sm font-semibold text-green-300">A practical workflow</p>
			<h2 id="workflow-title" class="mt-3 text-3xl font-bold text-slate-50 sm:text-4xl">
				From product question to market insight
			</h2>
			<p class="mt-4 text-base leading-7 text-slate-400">
				Keep every step connected so your team can understand where each insight came from.
			</p>
		</div>

		<ol class="mt-12 grid gap-4 lg:grid-cols-4">
			{#each workflowSteps as step, index (step.title)}
				<li class="relative flex">
					<article class="w-full rounded-lg border border-border bg-ink-850/90 p-6">
						<div class="flex items-center justify-between">
							<span
								class="grid h-9 w-9 place-items-center rounded-md border border-brand-light/30 bg-brand/10 text-sm font-bold text-purple-200"
							>
								{String(index + 1).padStart(2, '0')}
							</span>
							<span class="text-[11px] font-semibold text-slate-600 uppercase"
								>Step {index + 1}</span
							>
						</div>
						<h3 class="mt-6 text-base font-bold text-slate-100">{step.title}</h3>
						<p class="mt-3 text-sm leading-6 text-slate-400">{step.description}</p>
					</article>

					{#if index < workflowSteps.length - 1}
						<div
							class="absolute top-full left-1/2 z-10 -translate-x-1/2 -translate-y-0.5 text-brand-light lg:top-1/2 lg:left-full lg:-translate-x-2 lg:-translate-y-1/2"
							aria-hidden="true"
						>
							<ArrowDown class="lg:hidden" size={17} />
							<ArrowRight class="hidden lg:block" size={17} />
						</div>
					{/if}
				</li>
			{/each}
		</ol>
	</div>
</section>
