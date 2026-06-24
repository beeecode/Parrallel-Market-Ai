import {
	Box,
	ChartNoAxesCombined,
	LayoutDashboard,
	MessageSquareText,
	Settings,
	Users,
	Workflow
} from 'lucide-svelte';

import type { NavigationItem } from '$lib/types/navigation';

export const navigationItems: NavigationItem[] = [
	{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
	{ label: 'Simulations', href: '/simulations', icon: Workflow },
	{ label: 'Products', href: '/products', icon: Box, disabled: true },
	{ label: 'Customers', href: '/customers', icon: Users, disabled: true },
	{ label: 'Reports', href: '/reports', icon: MessageSquareText },
	{ label: 'Insights', href: '/insights', icon: ChartNoAxesCombined, disabled: true },
	{ label: 'Settings', href: '/settings', icon: Settings, disabled: true }
];
