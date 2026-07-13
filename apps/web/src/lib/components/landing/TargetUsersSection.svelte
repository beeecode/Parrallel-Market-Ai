<script lang="ts">
	import LandingIcon from './LandingIcon.svelte';
	import { audienceItems } from '$lib/features/landing/landing.constants';
</script>

<section aria-labelledby="audience-title" class="py-20 sm:py-24">
	<div class="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-2xl text-center">
			<p class="text-sm font-semibold text-brand-light">Designed for market builders</p>
			<h2 id="audience-title" class="mt-3 text-3xl font-bold text-slate-50 sm:text-4xl">
				Useful wherever a launch decision needs more clarity
			</h2>
		</div>

		<div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
			{#each audienceItems as audience (audience.title)}
				<article
					class="rounded-lg border border-border bg-ink-850/78 p-5 transition hover:border-brand-light/35 hover:bg-ink-850"
				>
					<LandingIcon class="text-brand-light" name={audience.icon} size={20} />
					<h3 class="mt-5 text-sm font-bold text-slate-100">{audience.title}</h3>
					<p class="mt-2 text-xs leading-5 text-slate-400">{audience.description}</p>
				</article>
			{/each}
		</div>
	</div>
</section>
