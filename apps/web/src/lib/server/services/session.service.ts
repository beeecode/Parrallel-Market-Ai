import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import type { Cookies } from '@sveltejs/kit';

const DEFAULT_COOKIE_NAME = 'parallel_market_session';
const MAX_SESSION_SECONDS = 60 * 60 * 24 * 7;

export function sessionCookieName(): string {
	return env.SESSION_COOKIE_NAME || DEFAULT_COOKIE_NAME;
}

export function getSessionToken(cookies: Cookies): string | null {
	return cookies.get(sessionCookieName()) || null;
}

function shouldUseSecureCookie(url?: URL): boolean {
	if (env.SESSION_COOKIE_SECURE === 'true') return true;
	if (env.SESSION_COOKIE_SECURE === 'false') return false;
	if (url) return url.protocol === 'https:';
	return !dev;
}

export function setSessionCookie(
	cookies: Cookies,
	token: string,
	expiresAt: number,
	url?: URL
): void {
	const now = Math.floor(Date.now() / 1000);
	const maxAge = Math.max(60, Math.min(expiresAt - now, MAX_SESSION_SECONDS));

	cookies.set(sessionCookieName(), token, {
		httpOnly: true,
		maxAge,
		path: '/',
		sameSite: 'lax',
		secure: shouldUseSecureCookie(url)
	});
}

export function clearSessionCookie(cookies: Cookies): void {
	cookies.delete(sessionCookieName(), {
		path: '/'
	});
}

export function safeInternalReturnPath(value: string | null | undefined): string {
	if (!value || !value.startsWith('/') || value.startsWith('//')) {
		return '/dashboard';
	}

	try {
		const parsed = new URL(value, 'http://internal.local');
		if (parsed.origin !== 'http://internal.local') return '/dashboard';
		return `${parsed.pathname}${parsed.search}${parsed.hash}`;
	} catch {
		return '/dashboard';
	}
}
