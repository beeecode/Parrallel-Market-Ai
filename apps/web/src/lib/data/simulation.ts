// Visual-reference fixture retained for comparison tests. Runtime routes use Payload services.
const liveSimulationData = {
	title: 'Live Simulation - Shawarma Spot Menu',
	status: 'Running',
	elapsedTime: '02:15:43',
	agents: [
		{
			id: 'tunde',
			name: 'Tunde',
			age: 24,
			avatarSrc: '/assets/2d/avatars/man.svg',
			avatarAlt: 'Tunde customer avatar',
			preview: 'Is delivery available to Yaba?',
			lastSeen: '12:30 PM',
			accent: '#8b5cf6'
		},
		{
			id: 'bola',
			name: 'Bola',
			age: 28,
			avatarSrc: '/assets/2d/avatars/woman.svg',
			avatarAlt: 'Bola customer avatar',
			preview: 'Do you have small pack?',
			lastSeen: '12:30 PM',
			accent: '#f59e0b'
		},
		{
			id: 'ada',
			name: 'Ada',
			age: 21,
			avatarSrc: '/assets/2d/avatars/girl.svg',
			avatarAlt: 'Ada customer avatar',
			preview: 'Your prices are a bit high o',
			lastSeen: '12:29 PM',
			accent: '#fb923c'
		},
		{
			id: 'emeka',
			name: 'Emeka',
			age: 30,
			avatarSrc: '/assets/2d/avatars/boy.svg',
			avatarAlt: 'Emeka customer avatar',
			preview: 'How long does delivery take?',
			lastSeen: '12:28 PM',
			accent: '#facc15'
		},
		{
			id: 'zainab',
			name: 'Zainab',
			age: 26,
			avatarSrc: '/assets/2d/avatars/woman-technologist.svg',
			avatarAlt: 'Zainab customer avatar',
			preview: 'Do you have discounts?',
			lastSeen: '12:27 PM',
			accent: '#60a5fa'
		},
		{
			id: 'musa',
			name: 'Musa',
			age: 27,
			avatarSrc: '/assets/2d/avatars/person.svg',
			avatarAlt: 'Musa customer avatar',
			preview: 'I prefer chicken over beef',
			lastSeen: '12:27 PM',
			accent: '#f97316'
		}
	],
	messages: [
		{
			id: 'message-1',
			sender: 'business',
			body: 'Is delivery available to Yaba?',
			timestamp: '12:30 PM'
		},
		{
			id: 'message-2',
			sender: 'customer',
			body: 'Yes o! Delivery to Yaba is available for just ₦800.',
			timestamp: '12:30 PM'
		},
		{
			id: 'message-3',
			sender: 'business',
			body: "That's a bit high. Can you reduce it?",
			timestamp: '12:31 PM'
		},
		{
			id: 'message-4',
			sender: 'customer',
			body: 'We can do ₦500 if your order is above ₦4,000',
			timestamp: '12:31 PM'
		},
		{
			id: 'message-5',
			sender: 'business',
			body: 'Okay cool. Do you have pepper extra?',
			timestamp: '12:31 PM'
		},
		{
			id: 'message-6',
			sender: 'customer',
			body: 'Yes! Pepper extra is available.',
			timestamp: '12:32 PM'
		}
	],
	activity: [
		{
			id: 'activity-1',
			title: 'Price objection detected',
			description: 'Ada flagged delivery fee and menu prices as too high.',
			timestamp: '12:31 PM',
			tone: 'warning'
		},
		{
			id: 'activity-2',
			title: 'Conversion intent increased',
			description: 'Tunde accepted delivery after a conditional discount.',
			timestamp: '12:32 PM',
			tone: 'success'
		},
		{
			id: 'activity-3',
			title: 'Trust signal requested',
			description: 'Zainab asked for checkout proof and delivery assurance.',
			timestamp: '12:34 PM',
			tone: 'neutral'
		}
	],
	stats: [
		{ label: 'Agents Active', value: '6', detail: 'Across Lagos food buyer segments' },
		{ label: 'Messages Captured', value: '3,842', detail: 'Chat, objections, and intent signals' },
		{ label: 'Purchase Intent', value: '23.7%', detail: 'Likely to buy after offer changes' },
		{ label: 'Objection Rate', value: '31%', detail: 'Mostly delivery and checkout trust' }
	]
};

export function getLiveSimulationData() {
	return liveSimulationData;
}
