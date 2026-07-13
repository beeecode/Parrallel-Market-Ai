<script lang="ts">
	import type { ComponentType, SvelteComponent } from 'svelte';
	import type { IconProps } from 'lucide-svelte';
	import {
		BarChart3,
		BriefcaseBusiness,
		Building2,
		ChartNoAxesCombined,
		ClipboardCheck,
		Compass,
		FileChartColumnIncreasing,
		FlaskConical,
		Layers3,
		Lightbulb,
		MessageCircleMore,
		MessageSquareText,
		Package,
		Radar,
		SearchCheck,
		ShieldCheck,
		Sparkles,
		Target,
		Users,
		WalletCards
	} from 'lucide-svelte';

	import type { LandingIconName } from '$lib/features/landing/landing.types';

	let {
		class: className = '',
		name,
		size = 20,
		strokeWidth = 1.8
	}: {
		class?: string;
		name: LandingIconName;
		size?: number;
		strokeWidth?: number;
	} = $props();

	const iconMap: Record<LandingIconName, ComponentType<SvelteComponent<IconProps>>> = {
		'bar-chart': BarChart3,
		briefcase: BriefcaseBusiness,
		building: Building2,
		chat: MessageCircleMore,
		clipboard: ClipboardCheck,
		compass: Compass,
		'file-chart': FileChartColumnIncreasing,
		flask: FlaskConical,
		layers: Layers3,
		lightbulb: Lightbulb,
		'message-search': MessageSquareText,
		package: Package,
		radar: Radar,
		search: SearchCheck,
		shield: ShieldCheck,
		sparkles: Sparkles,
		target: Target,
		'trending-up': ChartNoAxesCombined,
		users: Users,
		wallet: WalletCards
	};

	const Icon = $derived(iconMap[name]);
</script>

<Icon aria-hidden="true" class={className} {size} {strokeWidth} />
