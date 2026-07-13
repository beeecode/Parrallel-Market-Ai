import {
	Box,
	ChartNoAxesCombined,
	LayoutDashboard,
	MessageSquareText,
	Settings,
	Sparkles,
	Users,
	Workflow
} from 'lucide-svelte';

import type { NavigationItem } from '$lib/types/navigation';

export const navigationItems: NavigationItem[] = [
	{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
	{ label: 'Simulations', href: '/simulations', icon: Workflow },
	{ label: 'Products', href: '/products', icon: Box },
	{ label: 'Customers', href: '/customers', icon: Users },
	{ label: 'Reports', href: '/reports', icon: MessageSquareText },
	{ label: 'Insights', href: '/insights', icon: ChartNoAxesCombined },
	{ label: 'Request Simulation', href: '/request-simulation', icon: Sparkles },
	{ label: 'Settings', href: '/settings', icon: Settings }
];
