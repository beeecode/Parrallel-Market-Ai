import { env } from '$env/dynamic/private';

export const mockPayloadToken = 'mock-payload-preview-token';

export function isFrontendMockMode(): boolean {
	if (env.NODE_ENV === 'test' || env.VITEST === 'true') return false;

	const value = env.FRONTEND_MOCK_MODE?.trim().toLowerCase();
	return value === '1' || value === 'true' || value === 'yes' || value === 'on';
}
