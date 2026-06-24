export function formatPercent(value: number): string {
	return `${value}%`;
}

export function getCurrentTimeLabel(): string {
	return new Date().toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit'
	});
}

export function buildLinePath(values: number[], width: number, height: number): string {
	if (values.length === 0) return '';

	const minimum = Math.min(...values);
	const maximum = Math.max(...values);
	const range = Math.max(maximum - minimum, 1);
	const step = values.length > 1 ? width / (values.length - 1) : width;

	return values
		.map((value, index) => {
			const x = index * step;
			const y = height - ((value - minimum) / range) * (height - 12) - 6;
			return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
		})
		.join(' ');
}
