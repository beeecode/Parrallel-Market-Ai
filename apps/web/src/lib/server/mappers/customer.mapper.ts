import type { PriceSensitivity } from '@parallel-market-ai/shared-types';

import type { CustomerAgentListViewModel } from '$lib/types/customer';
import type {
	PayloadCustomerAgent,
	PayloadMedia,
	PayloadSimulation
} from '$lib/server/payload/types';
import { titleCase } from './mapper-utils';

const fallbackAvatars = [
	'/assets/2d/avatars/man.svg',
	'/assets/2d/avatars/woman.svg',
	'/assets/2d/avatars/girl.svg',
	'/assets/2d/avatars/boy.svg',
	'/assets/2d/avatars/person.svg',
	'/assets/2d/avatars/woman-technologist.svg'
];

export const priceSensitivityOptions: CustomerAgentListViewModel['priceSensitivityOptions'] = [
	{ label: 'All sensitivities', value: 'all' },
	{ label: 'Low', value: 'low' },
	{ label: 'Moderate', value: 'moderate' },
	{ label: 'High', value: 'high' },
	{ label: 'Very high', value: 'very-high' }
];

function mediaUrl(value: PayloadCustomerAgent['avatar']): string | undefined {
	if (typeof value === 'object' && value) {
		const media = value as PayloadMedia;
		return media.url || undefined;
	}

	return undefined;
}

function simulationSummary(value: PayloadCustomerAgent['simulation']): {
	id: string;
	status: PayloadSimulation['status'];
	title: string;
} {
	if (typeof value === 'object' && value !== null) {
		return {
			id: String(value.id),
			status: value.status,
			title: value.title
		};
	}

	return {
		id: String(value),
		status: 'draft',
		title: 'Simulation'
	};
}

export function mapCustomerAgents(
	agents: PayloadCustomerAgent[],
	filters: CustomerAgentListViewModel['filters']
): CustomerAgentListViewModel {
	const simulationOptionsMap = new Map<string, string>();

	const customers = agents.map((agent, index) => {
		const simulation = simulationSummary(agent.simulation);
		const sensitivity: PriceSensitivity = agent.priceSensitivity ?? 'moderate';
		simulationOptionsMap.set(simulation.id, simulation.title);

		return {
			id: String(agent.id),
			name: agent.name,
			age: agent.age,
			location: agent.location || 'Not specified',
			occupation: agent.occupation || 'Not specified',
			incomeLevel: agent.incomeLevel || 'Not specified',
			priceSensitivity: sensitivity,
			priceSensitivityLabel: titleCase(sensitivity),
			communicationStyle: agent.communicationStyle || 'Not specified',
			buyingBehaviour: agent.buyingBehaviour || 'Not specified',
			relatedSimulation: simulation,
			isActive: agent.isActive !== false,
			avatarSrc: mediaUrl(agent.avatar) ?? fallbackAvatars[index % fallbackAvatars.length],
			avatarAlt: `${agent.name} customer avatar`
		};
	});

	return {
		customers,
		filters,
		priceSensitivityOptions,
		simulationOptions: [
			{ label: 'All simulations', value: 'all' },
			...[...simulationOptionsMap.entries()]
				.sort((left, right) => left[1].localeCompare(right[1]))
				.map(([value, label]) => ({ label, value }))
		],
		total: customers.length
	};
}
