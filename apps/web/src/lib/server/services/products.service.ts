import type { AuthenticatedUser } from '$lib/types/auth';
import type {
	ProductDetailViewModel,
	ProductFormInput,
	ProductListFilters,
	ProductListViewModel
} from '$lib/types/product';
import { mapProductDetail, mapProductList } from '$lib/server/mappers/product.mapper';
import { getMockProductDetailData, getMockProductsData } from '$lib/server/mock/data';
import { isFrontendMockMode } from '$lib/server/mock/mode';
import { PayloadNotFoundError, PayloadValidationError } from '$lib/server/payload/errors';
import { payloadRequest } from '$lib/server/payload/client';
import type { PayloadQueryValue } from '$lib/server/payload/query';
import {
	isPayloadProduct,
	isPayloadSimulation,
	payloadDocumentValidator,
	payloadListValidator,
	type PayloadProduct,
	type PayloadSimulation
} from '$lib/server/payload/types';
import { productInputFromFormData, validateProductForm } from '$lib/validation/forms';

function productWhere(filters: ProductListFilters): PayloadQueryValue | undefined {
	const clauses: PayloadQueryValue[] = [];

	if (filters.status && filters.status !== 'all') {
		clauses.push({ status: { equals: filters.status } });
	}

	if (filters.category) {
		clauses.push({ category: { equals: filters.category } });
	}

	if (filters.search) {
		clauses.push({
			or: [
				{ name: { contains: filters.search } },
				{ category: { contains: filters.search } },
				{ targetMarket: { contains: filters.search } },
				{ targetLocation: { contains: filters.search } }
			]
		});
	}

	if (clauses.length === 0) return undefined;
	return clauses.length === 1 ? clauses[0] : { and: clauses };
}

function safeFilter(value: string | null): string | undefined {
	const trimmed = value?.trim();
	return trimmed || undefined;
}

export function productFiltersFromUrl(url: URL): ProductListFilters {
	const status = safeFilter(url.searchParams.get('status')) as ProductListFilters['status'];

	return {
		category: safeFilter(url.searchParams.get('category')),
		search: safeFilter(url.searchParams.get('search')),
		status: status || 'all'
	};
}

async function getAccessibleSimulations(
	fetch: typeof globalThis.fetch,
	token: string,
	productId?: number
): Promise<PayloadSimulation[]> {
	const response = await payloadRequest({
		fetch,
		path: '/api/simulations',
		query: {
			depth: 0,
			limit: 200,
			sort: '-updatedAt',
			...(productId ? { where: { product: { equals: productId } } } : {})
		},
		token,
		validate: payloadListValidator<PayloadSimulation>(isPayloadSimulation)
	});

	return response.docs;
}

export async function getProductsData(
	fetch: typeof globalThis.fetch,
	token: string,
	filters: ProductListFilters
): Promise<ProductListViewModel> {
	if (isFrontendMockMode()) return getMockProductsData(filters);

	const [productResponse, simulations] = await Promise.all([
		payloadRequest({
			fetch,
			path: '/api/products',
			query: {
				depth: 0,
				limit: 100,
				sort: '-updatedAt',
				where: productWhere(filters)
			},
			token,
			validate: payloadListValidator<PayloadProduct>(isPayloadProduct)
		}),
		getAccessibleSimulations(fetch, token)
	]);

	return mapProductList(productResponse.docs, simulations, filters);
}

export async function getProductDetailData(
	fetch: typeof globalThis.fetch,
	token: string,
	productId: number
): Promise<ProductDetailViewModel> {
	if (isFrontendMockMode()) {
		const product = getMockProductDetailData(productId);
		if (!product) throw new PayloadNotFoundError('This product could not be found.');
		return product;
	}

	const productResponse = await payloadRequest({
		fetch,
		path: '/api/products',
		query: {
			depth: 0,
			limit: 1,
			where: { id: { equals: productId } }
		},
		token,
		validate: payloadListValidator<PayloadProduct>(isPayloadProduct)
	});
	const product = productResponse.docs[0];

	if (!product) {
		throw new PayloadNotFoundError('This product could not be found.');
	}

	const simulations = await getAccessibleSimulations(fetch, token, product.id);
	return mapProductDetail(product, simulations);
}

export async function createProduct(
	fetch: typeof globalThis.fetch,
	token: string,
	user: AuthenticatedUser,
	input: ProductFormInput
): Promise<{ id: string }> {
	const validation = validateProductForm(input);
	if (validation.errors) {
		throw new PayloadValidationError('Check the product details and try again.', validation.errors);
	}

	if (isFrontendMockMode()) return { id: '101' };

	const response = await payloadRequest({
		body: {
			...validation.data,
			owner: user.id
		},
		fetch,
		method: 'POST',
		path: '/api/products',
		token,
		validate: payloadDocumentValidator<PayloadProduct>(isPayloadProduct)
	});

	return { id: String(response.doc.id) };
}

export function productFormInputFromRequest(formData: FormData): ProductFormInput {
	return productInputFromFormData(formData);
}
