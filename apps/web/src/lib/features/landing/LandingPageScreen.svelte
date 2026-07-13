<script lang="ts">
	import BenefitsSection from '$lib/components/landing/BenefitsSection.svelte';
	import FaqSection from '$lib/components/landing/FaqSection.svelte';
	import FeaturesSection from '$lib/components/landing/FeaturesSection.svelte';
	import FinalCtaSection from '$lib/components/landing/FinalCtaSection.svelte';
	import HeroSection from '$lib/components/landing/HeroSection.svelte';
	import HowItWorksSection from '$lib/components/landing/HowItWorksSection.svelte';
	import InteractiveDemoSection from '$lib/components/landing/InteractiveDemoSection.svelte';
	import LandingFooter from '$lib/components/landing/LandingFooter.svelte';
	import LandingNavbar from '$lib/components/landing/LandingNavbar.svelte';
	import ProductShowcaseSection from '$lib/components/landing/ProductShowcaseSection.svelte';
	import TargetUsersSection from '$lib/components/landing/TargetUsersSection.svelte';
	import TrustStrip from '$lib/components/landing/TrustStrip.svelte';
	import UseCasesSection from '$lib/components/landing/UseCasesSection.svelte';

	let { isAuthenticated }: { isAuthenticated: boolean } = $props();
</script>

<div class="min-h-screen bg-ink-950 text-slate-100" id="top">
	<LandingNavbar {isAuthenticated} />
	<main>
		<HeroSection {isAuthenticated} />
		<TrustStrip />
		<FeaturesSection />
		<HowItWorksSection />
		<ProductShowcaseSection />
		<BenefitsSection />
		<TargetUsersSection />
		<InteractiveDemoSection />
		<UseCasesSection />
		<FaqSection />
		<FinalCtaSection />
	</main>
	<LandingFooter />
</div>
