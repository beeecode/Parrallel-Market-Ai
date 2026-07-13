import type { ProductStatus } from '@parallel-market-ai/shared-types';

import type {
	ProductDetailViewModel,
	ProductListItem,
	ProductListViewModel,
	ProductRelatedSimulation
} from '$lib/types/product';
import type { PayloadProduct, PayloadSimulation } from '$lib/server/payload/types';
import { formatCurrency, formatDate, relationshipId, titleCase } from './mapper-utils';

const productStatusTone: Record<ProductStatus, ProductListItem['statusTone']> = {
	active: 'success',
	archived: 'neutral',
	draft: 'purple',
	inactive: 'warning'
};

export const productStatusOptions: ProductListViewModel['statusOptions'] = [
	{ label: 'All statuses', value: 'all' },
	{ label: 'Draft', value: 'draft' },
	{ label: 'Active', value: 'active' },
	{ label: 'Inactive', value: 'inactive' },
	{ label: 'Archived', value: 'archived' }
];

function productIdFromSimulation(simulation: PayloadSimulation): number | null {
	return relationshipId(simulation.product);
}

function simulationHref(simulation: PayloadSimulation): string {
	return `/simulations/${simulation.id}/live`;
}

export function mapProductList(
	products: PayloadProduct[],
	simulations: PayloadSimulation[],
	filters: ProductListViewModel['filters']
): ProductListViewModel {
	const simulationCountByProduct = new Map<number, number>();
	for (const simulation of simulations) {
		const productId = productIdFromSimulation(simulation);
		if (productId === null) continue;
		simulationCountByProduct.set(productId, (simulationCountByProduct.get(productId) ?? 0) + 1);
	}

	const categories = [...new Set(products.map((product) => product.category).filter(Boolean))].sort(
		(left, right) => left.localeCompare(right)
	);

	return {
		categories,
		filters,
		products: products.map((product) => ({
			id: String(product.id),
			name: product.name,
			category: product.category,
			currentPrice: formatCurrency(product.currentPrice, product.currency),
			currency: product.currency,
			targetMarket: product.targetMarket,
			targetLocation: product.targetLocation,
			status: product.status,
			statusLabel: titleCase(product.status),
			statusTone: productStatusTone[product.status],
			simulationCount: simulationCountByProduct.get(product.id) ?? 0,
			updatedAt: formatDate(product.updatedAt),
			href: `/products/${product.id}`
		})),
		statusOptions: productStatusOptions,
		total: products.length
	};
}

function mapRelatedSimulation(simulation: PayloadSimulation): ProductRelatedSimulation {
	return {
		id: String(simulation.id),
		title: simulation.title,
		status: simulation.status,
		statusLabel: titleCase(simulation.status),
		successProbability:
			typeof simulation.successProbability === 'number'
				? `${simulation.successProbability}%`
				: 'Pending',
		updatedAt: formatDate(simulation.updatedAt),
		href: simulationHref(simulation)
	};
}

export function mapProductDetail(
	product: PayloadProduct,
	simulations: PayloadSimulation[]
): ProductDetailViewModel {
	return {
		id: String(product.id),
		name: product.name,
		category: product.category,
		description: product.description,
		currentPrice: formatCurrency(product.currentPrice, product.currency),
		currency: product.currency,
		targetMarket: product.targetMarket,
		targetLocation: product.targetLocation,
		status: product.status,
		statusLabel: titleCase(product.status),
		createdAt: formatDate(product.createdAt),
		updatedAt: formatDate(product.updatedAt),
		relatedSimulations: simulations.map(mapRelatedSimulation),
		createSimulationHref: `/simulations/new?product=${product.id}`
	};
}
