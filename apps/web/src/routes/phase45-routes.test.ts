import { beforeEach, describe, expect, it, vi } from 'vitest';

const serviceMocks = vi.hoisted(() => ({
	createProduct: vi.fn(),
	createSimulation: vi.fn(),
	getCustomersData: vi.fn(),
	getInsightsData: vi.fn(),
	getProductDetailData: vi.fn(),
	getProductsData: vi.fn(),
	getReportById: vi.fn(),
	getSettingsData: vi.fn(),
	getSimulationCreateData: vi.fn(),
	getSimulationWorkspace: vi.fn()
}));

vi.mock('$lib/server/services/products.service', async (importOriginal) => {
	const actual = await importOriginal<typeof import('$lib/server/services/products.service')>();
	return {
		...actual,
		createProduct: serviceMocks.createProduct,
		getProductDetailData: serviceMocks.getProductDetailData,
		getProductsData: serviceMocks.getProductsData
	};
});
vi.mock('$lib/server/services/customers.service', async (importOriginal) => {
	const actual = await importOriginal<typeof import('$lib/server/services/customers.service')>();
	return {
		...actual,
		getCustomersData: serviceMocks.getCustomersData
	};
});
vi.mock('$lib/server/services/insights.service', () => ({
	getInsightsData: serviceMocks.getInsightsData
}));
vi.mock('$lib/server/services/settings.service', () => ({
	getSettingsData: serviceMocks.getSettingsData
}));
vi.mock('$lib/server/services/simulation-create.service', async (importOriginal) => {
	const actual =
		await importOriginal<typeof import('$lib/server/services/simulation-create.service')>();
	return {
		...actual,
		createSimulation: serviceMocks.createSimulation,
		getSimulationCreateData: serviceMocks.getSimulationCreateData
	};
});
vi.mock('$lib/server/services/simulations.service', () => ({
	getSimulationWorkspace: serviceMocks.getSimulationWorkspace
}));
vi.mock('$lib/server/services/reports.service', async (importOriginal) => {
	const actual = await importOriginal<typeof import('$lib/server/services/reports.service')>();
	return {
		...actual,
		getReportById: serviceMocks.getReportById
	};
});

import { load as customersLoad } from './customers/+page.server';
import { load as insightsLoad } from './insights/+page.server';
import { load as productDetailLoad } from './products/[id]/+page.server';
import { actions as productActions, load as productNewLoad } from './products/new/+page.server';
import { load as productsLoad } from './products/+page.server';
import { load as reportDetailLoad } from './reports/[id]/+page.server';
import { load as settingsLoad } from './settings/+page.server';
import { load as simulationLiveLoad } from './simulations/[id]/live/+page.server';
import {
	actions as simulationNewActions,
	load as simulationNewLoad
} from './simulations/new/+page.server';

const user = {
	email: 'owner@example.com',
	id: 7,
	name: 'Demo Owner',
	role: 'business-owner' as const
};

const eventBase = {
	cookies: {},
	fetch,
	locals: {
		payloadToken: 'valid-token',
		user
	}
};

function formRequest(path: string, values: Record<string, string>): Request {
	return new Request(`http://localhost${path}`, {
		body: new URLSearchParams(values),
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		method: 'POST'
	});
}

describe('Phase 4.5 route server modules', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('loads product list data with URL filters', async () => {
		serviceMocks.getProductsData.mockResolvedValue({ products: [] });

		const result = await productsLoad({
			...eventBase,
			url: new URL('http://localhost/products?status=active&search=shawarma')
		} as never);

		expect(result).toEqual({ products: { products: [] } });
		expect(serviceMocks.getProductsData).toHaveBeenCalledWith(
			fetch,
			'valid-token',
			expect.objectContaining({ search: 'shawarma', status: 'active' })
		);
	});

	it('creates products and redirects to the product detail page', async () => {
		serviceMocks.createProduct.mockResolvedValue({ id: '12' });

		const result = await Promise.resolve(
			productActions.default!({
				...eventBase,
				request: formRequest('/products/new', {
					category: 'Food',
					currency: 'NGN',
					currentPrice: '4200',
					description: 'A food product',
					name: 'New Product',
					status: 'draft',
					targetLocation: 'Lagos',
					targetMarket: 'Delivery customers'
				}),
				url: new URL('http://localhost/products/new')
			} as never)
		).catch((cause: unknown) => cause);

		expect(result).toMatchObject({ location: '/products/12', status: 303 });
		expect(serviceMocks.createProduct).toHaveBeenCalledWith(
			fetch,
			'valid-token',
			user,
			expect.objectContaining({ name: 'New Product' })
		);
	});

	it('loads product detail data by ID', async () => {
		serviceMocks.getProductDetailData.mockResolvedValue({ id: '12' });

		const result = await productDetailLoad({
			...eventBase,
			params: { id: '12' },
			url: new URL('http://localhost/products/12')
		} as never);

		expect(result).toEqual({ product: { id: '12' } });
		expect(serviceMocks.getProductDetailData).toHaveBeenCalledWith(fetch, 'valid-token', 12);
	});

	it('loads customer and insight pages through services', async () => {
		serviceMocks.getCustomersData.mockResolvedValue({ customers: [] });
		serviceMocks.getInsightsData.mockResolvedValue({ cards: [] });

		await customersLoad({
			...eventBase,
			url: new URL('http://localhost/customers?priceSensitivity=high')
		} as never);
		await insightsLoad({
			...eventBase,
			url: new URL('http://localhost/insights')
		} as never);

		expect(serviceMocks.getCustomersData).toHaveBeenCalledWith(
			fetch,
			'valid-token',
			expect.objectContaining({ priceSensitivity: 'high' })
		);
		expect(serviceMocks.getInsightsData).toHaveBeenCalledWith(fetch, 'valid-token');
	});

	it('loads settings from the authenticated session user', () => {
		serviceMocks.getSettingsData.mockReturnValue({ profile: { name: user.name } });

		const result = settingsLoad(eventBase as never);

		expect(result).toEqual({ settings: { profile: { name: user.name } } });
		expect(serviceMocks.getSettingsData).toHaveBeenCalledWith(user);
	});

	it('loads the simulation creation model and creates a draft simulation', async () => {
		serviceMocks.getSimulationCreateData.mockResolvedValue({ productOptions: [] });
		serviceMocks.createSimulation.mockResolvedValue({ id: '44' });

		const loadResult = await simulationNewLoad({
			...eventBase,
			url: new URL('http://localhost/simulations/new?product=7')
		} as never);
		const actionResult = await Promise.resolve(
			simulationNewActions.default!({
				...eventBase,
				request: formRequest('/simulations/new', {
					additionalInstructions: '',
					competitorContext: '',
					customerCount: '1000',
					customerSegments: '',
					marketConditions: '',
					pricingStrategy: '',
					product: '7',
					simulationGoal: 'Measure price sensitivity',
					targetAudience: 'Lagos customers',
					targetLocation: 'Lagos',
					title: 'New simulation'
				}),
				url: new URL('http://localhost/simulations/new')
			} as never)
		).catch((cause: unknown) => cause);

		expect(loadResult).toEqual({ simulationForm: { productOptions: [] } });
		expect(actionResult).toMatchObject({ location: '/simulations/44/live', status: 303 });
	});

	it('loads specific simulation live and report detail routes', async () => {
		serviceMocks.getSimulationWorkspace.mockResolvedValue({ simulationId: '44' });
		serviceMocks.getReportById.mockResolvedValue({ id: '22' });

		const simulationResult = await simulationLiveLoad({
			...eventBase,
			params: { id: '44' },
			url: new URL('http://localhost/simulations/44/live')
		} as never);
		const reportResult = await reportDetailLoad({
			...eventBase,
			params: { id: '22' },
			url: new URL('http://localhost/reports/22')
		} as never);

		expect(simulationResult).toEqual({ simulation: { simulationId: '44' } });
		expect(reportResult).toEqual({ report: { id: '22' } });
		expect(serviceMocks.getSimulationWorkspace).toHaveBeenCalledWith(fetch, 'valid-token', 44);
		expect(serviceMocks.getReportById).toHaveBeenCalledWith(fetch, 'valid-token', 22);
	});

	it('keeps the new product page loader thin', async () => {
		await expect(productNewLoad({} as never)).resolves.toHaveProperty('values');
	});
});
