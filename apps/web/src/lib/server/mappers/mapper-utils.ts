import type { CurrencyCode } from '@parallel-market-ai/shared-types';

export function relationshipId(value: unknown): number | null {
	if (typeof value === 'number') return value;

	if (typeof value === 'object' && value !== null) {
		const id = Reflect.get(value, 'id');
		return typeof id === 'number' ? id : null;
	}

	return null;
}

export function formatCurrency(value: number, currency: CurrencyCode): string {
	return new Intl.NumberFormat('en-NG', {
		currency,
		maximumFractionDigits: 0,
		style: 'currency'
	}).format(value);
}

export function formatCompactCurrency(value: number, currency: CurrencyCode): string {
	return new Intl.NumberFormat('en-NG', {
		currency,
		maximumFractionDigits: 1,
		notation: 'compact',
		style: 'currency'
	}).format(value);
}

export function formatDate(value?: string | null): string {
	if (!value) return 'Not available';

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return 'Not available';

	return new Intl.DateTimeFormat('en-NG', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	}).format(date);
}

export function formatTime(value?: string | null): string {
	if (!value) return '';

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';

	return new Intl.DateTimeFormat('en-NG', {
		hour: '2-digit',
		minute: '2-digit'
	}).format(date);
}

export function formatElapsed(start?: string | null, end?: string | null): string {
	if (!start) return '00:00:00';

	const startTime = new Date(start).getTime();
	const endTime = end ? new Date(end).getTime() : Date.now();
	if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) return '00:00:00';

	const totalSeconds = Math.max(0, Math.floor((endTime - startTime) / 1000));
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

export function titleCase(value: string): string {
	return value
		.split('-')
		.map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
		.join(' ');
}
