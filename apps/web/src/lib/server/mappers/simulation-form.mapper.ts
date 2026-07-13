import type { SimulationProductOption } from '$lib/types/simulation-form';
import type { PayloadProduct } from '$lib/server/payload/types';
import { formatCurrency } from './mapper-utils';

export function mapSimulationProductOptions(products: PayloadProduct[]): SimulationProductOption[] {
	return products.map((product) => ({
		id: String(product.id),
		name: product.name,
		category: product.category,
		currency: product.currency,
		currentPrice: formatCurrency(product.currentPrice, product.currency),
		targetLocation: product.targetLocation,
		targetMarket: product.targetMarket
	}));
}
