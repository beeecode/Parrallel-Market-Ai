export type PayloadListResponse<T> = {
	docs: T[];
	hasNextPage: boolean;
	hasPrevPage: boolean;
	limit: number;
	nextPage: number | null;
	page: number;
	pagingCounter: number;
	prevPage: number | null;
	totalDocs: number;
	totalPages: number;
};

export type RouteErrorKind =
	| 'authentication'
	| 'permission'
	| 'not-found'
	| 'validation'
	| 'rate-limit'
	| 'network'
	| 'server';
