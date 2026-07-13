<script lang="ts">
	import { ArrowRight, ClipboardPenLine } from 'lucide-svelte';
	import { resolve } from '$app/paths';
</script>

<section aria-labelledby="final-cta-title" class="relative overflow-hidden py-20 sm:py-24">
	<div
		class="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(124,58,237,0.11),transparent_42%,rgba(34,197,94,0.055))]"
		aria-hidden="true"
	></div>
	<div class="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
		<p class="text-sm font-semibold text-brand-light">Build the next decision on clearer signals</p>
		<h2 id="final-cta-title" class="mt-3 text-3xl font-bold text-slate-50 sm:text-4xl lg:text-5xl">
			Make smarter launch decisions before spending more money
		</h2>
		<p class="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
			Structure your product assumptions, explore customer reactions, and identify what deserves
			real-world validation next.
		</p>
		<div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
			<a
				class="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brand px-5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(124,58,237,0.2)] transition hover:bg-brand-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
				href={resolve('/login')}
			>
				Start Simulating <ArrowRight aria-hidden="true" size={17} />
			</a>
			<a
				class="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border bg-ink-850/90 px-5 text-sm font-semibold text-slate-100 transition hover:border-brand-light/45 hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
				href={resolve('/request-simulation')}
			>
				<ClipboardPenLine aria-hidden="true" size={17} /> Request a Custom Simulation
			</a>
		</div>
	</div>
</section>
