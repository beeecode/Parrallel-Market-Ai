import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	return {
		isAuthenticated: Boolean(locals.user)
	};
};
