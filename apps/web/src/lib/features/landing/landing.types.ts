export type LandingIconName =
	| 'bar-chart'
	| 'briefcase'
	| 'building'
	| 'chat'
	| 'clipboard'
	| 'compass'
	| 'file-chart'
	| 'flask'
	| 'layers'
	| 'lightbulb'
	| 'message-search'
	| 'package'
	| 'radar'
	| 'search'
	| 'shield'
	| 'sparkles'
	| 'target'
	| 'trending-up'
	| 'users'
	| 'wallet';

export type LandingAnchor =
	| '/#features'
	| '/#how-it-works'
	| '/#use-cases'
	| '/#showcase'
	| '/#faq';

export interface LandingNavItem {
	href: LandingAnchor;
	label: string;
}

export interface TrustMetric {
	label: string;
	value: string;
}

export interface FeatureItem {
	description: string;
	icon: LandingIconName;
	title: string;
}

export interface WorkflowStep {
	description: string;
	title: string;
}

export type ShowcaseTabId = 'dashboard' | 'simulation' | 'report' | 'request-agent';

export interface ShowcaseTab {
	description: string;
	highlights: readonly string[];
	id: ShowcaseTabId;
	label: string;
	title: string;
}

export interface BenefitItem {
	description: string;
	icon: LandingIconName;
	title: string;
}

export interface AudienceItem {
	description: string;
	icon: LandingIconName;
	title: string;
}

export type DemoPersonaId = 'tunde' | 'ada' | 'zainab';

export interface DemoPersona {
	avatar: string;
	concern: string;
	id: DemoPersonaId;
	label: string;
	message: string;
	name: string;
	reply: string;
}

export interface UseCaseItem {
	description: string;
	icon: LandingIconName;
	insight: string;
	title: string;
}

export interface FaqItem {
	answer: string;
	question: string;
}

export interface FooterGroup {
	links: readonly {
		href?: LandingAnchor | '/dashboard' | '/simulations' | '/reports' | '/request-simulation';
		label: string;
		status?: 'future';
	}[];
	title: string;
}
