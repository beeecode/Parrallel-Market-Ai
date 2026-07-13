export type PayloadQueryValue =
	| boolean
	| number
	| string
	| null
	| PayloadQueryValue[]
	| { [key: string]: PayloadQueryValue };

function appendQueryValue(params: URLSearchParams, key: string, value: PayloadQueryValue): void {
	if (value === null) {
		return;
	}

	if (Array.isArray(value)) {
		value.forEach((item, index) => appendQueryValue(params, `${key}[${index}]`, item));
		return;
	}

	if (typeof value === 'object') {
		for (const [nestedKey, nestedValue] of Object.entries(value)) {
			appendQueryValue(params, `${key}[${nestedKey}]`, nestedValue);
		}
		return;
	}

	params.append(key, String(value));
}

export function buildPayloadQuery(
	query: Record<string, PayloadQueryValue | undefined> = {}
): URLSearchParams {
	const params = new URLSearchParams();

	for (const [key, value] of Object.entries(query)) {
		if (value !== undefined) {
			appendQueryValue(params, key, value);
		}
	}

	return params;
}
