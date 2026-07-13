import type { ComponentType, SvelteComponent } from 'svelte';
import type { IconProps } from 'lucide-svelte';

export type NavigationHref =
	| '/dashboard'
	| '/simulations'
	| '/products'
	| '/customers'
	| '/reports'
	| '/insights'
	| '/request-simulation'
	| '/settings';

export type NavigationItem = {
	label: string;
	href: NavigationHref;
	icon: ComponentType<SvelteComponent<IconProps>>;
	disabled?: boolean;
};
