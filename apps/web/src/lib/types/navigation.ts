import type { ComponentType, SvelteComponent } from 'svelte';
import type { IconProps } from 'lucide-svelte';

export type NavigationItem = {
	label: string;
	href: string;
	icon: ComponentType<SvelteComponent<IconProps>>;
	disabled?: boolean;
};
