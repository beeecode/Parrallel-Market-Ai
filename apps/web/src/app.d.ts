import type { AuthenticatedUser } from '$lib/types/auth';

declare global {
	namespace App {
		interface Error {
			message: string;
		}
		interface Locals {
			payloadToken: string | null;
			user: AuthenticatedUser | null;
		}
		interface PageData {
			user: AuthenticatedUser | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
