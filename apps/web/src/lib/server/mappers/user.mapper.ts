import { env } from '$env/dynamic/private';

import type { AuthenticatedUser } from '$lib/types/auth';
import type { PayloadMedia, PayloadUser } from '$lib/server/payload/types';

function isMedia(value: unknown): value is PayloadMedia {
	return (
		typeof value === 'object' && value !== null && typeof Reflect.get(value, 'id') === 'number'
	);
}

function mediaUrl(value: unknown): string | undefined {
	if (!isMedia(value) || typeof value.url !== 'string' || !value.url) {
		return undefined;
	}

	if (value.url.startsWith('http://') || value.url.startsWith('https://')) {
		return value.url;
	}

	const baseUrl = (env.CMS_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
	return `${baseUrl}${value.url.startsWith('/') ? value.url : `/${value.url}`}`;
}

export function mapAuthenticatedUser(user: PayloadUser): AuthenticatedUser {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
		company: user.company || undefined,
		avatarUrl: mediaUrl(user.avatar)
	};
}
