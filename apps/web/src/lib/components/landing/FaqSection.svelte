<script lang="ts">
	import { ChevronDown } from 'lucide-svelte';

	import { faqItems } from '$lib/features/landing/landing.constants';

	let openIndex: number | null = $state(0);
</script>

<section
	aria-labelledby="faq-title"
	class="scroll-mt-20 border-y border-border/55 bg-ink-925/68 py-20 sm:py-24"
	id="faq"
>
	<div class="mx-auto grid max-w-[88rem] gap-10 px-4 sm:px-6 lg:grid-cols-[0.58fr_1.42fr] lg:px-8">
		<div>
			<p class="text-sm font-semibold text-green-300">Questions worth answering clearly</p>
			<h2 id="faq-title" class="mt-3 text-3xl font-bold text-slate-50 sm:text-4xl">
				A realistic view of what the platform does
			</h2>
			<p class="mt-5 text-base leading-7 text-slate-400">
				Parallel Market AI supports structured simulation and analysis. It complements serious
				customer research rather than replacing it.
			</p>
		</div>

		<div
			class="divide-y divide-border overflow-hidden rounded-lg border border-border bg-ink-850/80"
		>
			{#each faqItems as faq, index (faq.question)}
				<div>
					<h3>
						<button
							aria-controls={`faq-panel-${index}`}
							aria-expanded={openIndex === index}
							class="flex min-h-16 w-full items-center justify-between gap-5 px-5 py-4 text-left text-sm font-semibold text-slate-100 transition hover:bg-white/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-light sm:px-6 sm:text-base"
							onclick={() => (openIndex = openIndex === index ? null : index)}
							type="button"
						>
							{faq.question}
							<ChevronDown
								aria-hidden="true"
								class={`shrink-0 text-slate-500 transition ${openIndex === index ? 'rotate-180 text-brand-light' : ''}`}
								size={18}
							/>
						</button>
					</h3>
					{#if openIndex === index}
						<div class="px-5 pb-5 sm:px-6 sm:pb-6" id={`faq-panel-${index}`} role="region">
							<p class="max-w-3xl text-sm leading-7 text-slate-400">{faq.answer}</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>
