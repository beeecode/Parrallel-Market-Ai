import type {
	AudienceItem,
	BenefitItem,
	DemoPersona,
	FaqItem,
	FeatureItem,
	FooterGroup,
	LandingNavItem,
	ShowcaseTab,
	TrustMetric,
	UseCaseItem,
	WorkflowStep
} from './landing.types';

export const landingNavItems: readonly LandingNavItem[] = [
	{ href: '/#features', label: 'Features' },
	{ href: '/#how-it-works', label: 'How It Works' },
	{ href: '/#use-cases', label: 'Use Cases' },
	{ href: '/#showcase', label: 'Insights' },
	{ href: '/#faq', label: 'FAQ' }
];

export const trustMetrics: readonly TrustMetric[] = [
	{ value: '1,000+', label: 'simulated customer profiles' },
	{ value: '3,842', label: 'demo conversations analysed' },
	{ value: '72%', label: 'sample launch confidence score' },
	{ value: '₦3,200–₦3,800', label: 'example optimal price range' }
];

export const featureItems: readonly FeatureItem[] = [
	{
		description:
			'Structure product, audience, location, and market-condition scenarios before launch.',
		icon: 'radar',
		title: 'Market Simulation'
	},
	{
		description:
			'Explore distinct buyer profiles with practical motivations and price sensitivities.',
		icon: 'users',
		title: 'AI Customer Personas'
	},
	{
		description: 'Review sample conversations and test how your business handles buyer concerns.',
		icon: 'chat',
		title: 'Live Conversation Testing'
	},
	{
		description:
			'Compare demand signals across price points and identify a stronger testing range.',
		icon: 'trending-up',
		title: 'Pricing Intelligence'
	},
	{
		description: 'Surface recurring trust, delivery, value, and checkout concerns before launch.',
		icon: 'message-search',
		title: 'Objection Discovery'
	},
	{
		description: 'Turn simulation findings into structured summaries, risks, and next actions.',
		icon: 'file-chart',
		title: 'Executive Reports'
	}
];

export const workflowSteps: readonly WorkflowStep[] = [
	{
		title: 'Add your product or idea',
		description: 'Describe the offer, current price, market, and the decision you need to make.'
	},
	{
		title: 'Define the market to test',
		description: 'Set the target audience, location, customer count, and important conditions.'
	},
	{
		title: 'Explore customer reactions',
		description: 'Review persona conversations, buying signals, objections, and sentiment patterns.'
	},
	{
		title: 'Make a stronger decision',
		description: 'Use structured reports and recommendations to refine pricing and launch plans.'
	}
];

export const showcaseTabs: readonly ShowcaseTab[] = [
	{
		id: 'dashboard',
		label: 'Dashboard',
		title: 'A decision-ready market overview',
		description:
			'Track the most important simulation signals in one calm, scan-friendly workspace.',
		highlights: ['Launch confidence', 'Revenue range', 'Conversion metrics']
	},
	{
		id: 'simulation',
		label: 'Live Simulation',
		title: 'See how different personas respond',
		description: 'Move between customer profiles and review the concerns shaping purchase intent.',
		highlights: ['Persona context', 'Conversation testing', 'Buyer objections']
	},
	{
		id: 'report',
		label: 'Report',
		title: 'Turn reactions into practical insight',
		description: 'Bring sentiment, pricing, risks, and recommendations into a structured report.',
		highlights: ['Sentiment split', 'Price intelligence', 'Recommended actions']
	},
	{
		id: 'request-agent',
		label: 'Request Agent',
		title: 'Brief a custom simulation clearly',
		description: 'Use a guided intake flow to capture the business context a simulation needs.',
		highlights: ['Step-by-step intake', 'Review before submit', 'Structured request summary']
	}
];

export const benefitItems: readonly BenefitItem[] = [
	{
		title: 'Reduce launch guesswork',
		description: 'Bring customer, pricing, and risk questions into one structured test plan.',
		icon: 'compass'
	},
	{
		title: 'Test pricing earlier',
		description: 'Compare likely demand signals before committing more budget to a launch.',
		icon: 'wallet'
	},
	{
		title: 'Discover objections early',
		description:
			'Identify trust, delivery, and value concerns while they are still easier to address.',
		icon: 'search'
	},
	{
		title: 'Understand sentiment',
		description: 'See which reactions are positive, neutral, or negative across the simulation.',
		icon: 'bar-chart'
	},
	{
		title: 'Compare product ideas',
		description: 'Keep multiple products and simulations organised for clearer comparison.',
		icon: 'layers'
	},
	{
		title: 'Build a stronger market case',
		description: 'Translate findings into evidence-backed questions and next steps for your team.',
		icon: 'lightbulb'
	}
];

export const audienceItems: readonly AudienceItem[] = [
	{
		title: 'Founders',
		description: 'Pressure-test an early idea before committing limited time and capital.',
		icon: 'sparkles'
	},
	{
		title: 'SMEs',
		description: 'Explore demand, pricing, and customer concerns for a growing business.',
		icon: 'building'
	},
	{
		title: 'Product Teams',
		description: 'Add market signals to roadmap, positioning, and launch conversations.',
		icon: 'package'
	},
	{
		title: 'Market Researchers',
		description: 'Use structured simulations to sharpen hypotheses for real research.',
		icon: 'flask'
	},
	{
		title: 'Consultants',
		description: 'Organise client assumptions into a clear, reviewable simulation brief.',
		icon: 'briefcase'
	},
	{
		title: 'Agencies',
		description: 'Explore audience reactions before a campaign, offer, or market-entry push.',
		icon: 'target'
	}
];

export const demoPersonas: readonly DemoPersona[] = [
	{
		id: 'tunde',
		name: 'Tunde',
		label: 'Price-sensitive buyer',
		avatar: '/assets/2d/avatars/person.svg',
		concern: 'Price sensitivity',
		message: 'The meal looks good, but is there a smaller option below ₦3,500?',
		reply: 'Offer a smaller portion and explain the value difference clearly.'
	},
	{
		id: 'ada',
		name: 'Ada',
		label: 'Quality-focused buyer',
		avatar: '/assets/2d/avatars/woman.svg',
		concern: 'Quality proof',
		message: 'How fresh are the ingredients, and can I see what comes in the pack?',
		reply: 'Show ingredient details, portion photos, and preparation standards.'
	},
	{
		id: 'zainab',
		name: 'Zainab',
		label: 'Trust-conscious buyer',
		avatar: '/assets/2d/avatars/woman-technologist.svg',
		concern: 'Checkout trust',
		message: 'I want to order, but I do not recognise the checkout page. Is it secure?',
		reply: 'Add familiar payment signals, business details, and a clear refund policy.'
	}
];

export const useCaseItems: readonly UseCaseItem[] = [
	{
		title: 'Launching a new food product',
		description: 'Explore portion, delivery, taste, and price reactions before promotion.',
		insight: 'Example insight: delivery cost may outweigh product interest.',
		icon: 'package'
	},
	{
		title: 'Testing app pricing',
		description: 'Compare how different customer segments respond to plans and price points.',
		insight: 'Example insight: a lower entry tier may reduce first-purchase friction.',
		icon: 'wallet'
	},
	{
		title: 'Validating a marketplace idea',
		description: 'Test the clarity, relevance, and trust assumptions behind a new marketplace.',
		insight: 'Example insight: supply quality needs stronger proof than feature breadth.',
		icon: 'users'
	},
	{
		title: 'Understanding checkout trust',
		description: 'Explore where unfamiliar payment and checkout experiences create hesitation.',
		insight: 'Example insight: visible trust signals may support conversion confidence.',
		icon: 'shield'
	},
	{
		title: 'Preparing a market-entry report',
		description: 'Organise pricing, objections, and audience findings for stakeholder review.',
		insight: 'Example insight: recommendations can be grouped by risk and opportunity.',
		icon: 'clipboard'
	},
	{
		title: 'Testing SME product demand',
		description: 'Structure demand questions before investing in stock, media, or expansion.',
		insight: 'Example insight: demand may vary sharply by location and buyer profile.',
		icon: 'trending-up'
	}
];

export const faqItems: readonly FaqItem[] = [
	{
		question: 'What is Parallel Market AI?',
		answer:
			'Parallel Market AI is a market simulation workspace for organising products, customer personas, conversations, pricing signals, objections, and structured reports before a launch decision.'
	},
	{
		question: 'Is it a replacement for real customer research?',
		answer:
			'No. It is designed to sharpen assumptions and identify questions worth testing. Important decisions should still be supported by real customer interviews, surveys, experiments, and market evidence.'
	},
	{
		question: 'Can I test pricing with it?',
		answer:
			'Yes. Simulations can organise price-sensitivity signals and example demand ranges so you can decide which prices deserve real-world validation.'
	},
	{
		question: 'Can I request a custom simulation?',
		answer:
			'Yes. Authenticated users can complete a guided request that captures the business, product, audience, challenge, budget, and simulation goal for review.'
	},
	{
		question: 'Does it use real AI?',
		answer:
			'The product is designed for AI-assisted workflows, but the current custom request agent uses deterministic structured intake. It does not claim that an AI model generated a result when no provider is configured.'
	},
	{
		question: 'Who is it best for?',
		answer:
			'It is useful for founders, SMEs, product teams, researchers, consultants, agencies, food businesses, e-commerce teams, and digital product builders evaluating a market decision.'
	},
	{
		question: 'Is my business data private?',
		answer:
			'Private application data is protected behind authentication and Payload access controls. Access is scoped by user role and record ownership where applicable.'
	}
];

export const footerGroups: readonly FooterGroup[] = [
	{
		title: 'Product',
		links: [
			{ label: 'Dashboard', href: '/dashboard' },
			{ label: 'Simulations', href: '/simulations' },
			{ label: 'Reports', href: '/reports' },
			{ label: 'Request Simulation', href: '/request-simulation' }
		]
	},
	{
		title: 'Explore',
		links: [
			{ label: 'Features', href: '/#features' },
			{ label: 'How It Works', href: '/#how-it-works' },
			{ label: 'Use Cases', href: '/#use-cases' },
			{ label: 'FAQ', href: '/#faq' }
		]
	},
	{
		title: 'Company',
		links: [
			{ label: 'About', status: 'future' },
			{ label: 'Contact', status: 'future' },
			{ label: 'Privacy', status: 'future' },
			{ label: 'Terms', status: 'future' }
		]
	}
];
