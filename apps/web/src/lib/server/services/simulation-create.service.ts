import type { AuthenticatedUser } from '$lib/types/auth';
import type { SimulationCreateInput, SimulationCreateViewModel } from '$lib/types/simulation-form';
import { mapSimulationProductOptions } from '$lib/server/mappers/simulation-form.mapper';
import { getMockProductDetailData, getMockSimulationCreateData } from '$lib/server/mock/data';
import { isFrontendMockMode } from '$lib/server/mock/mode';
import { PayloadNotFoundError, PayloadValidationError } from '$lib/server/payload/errors';
import { payloadRequest } from '$lib/server/payload/client';
import {
	isPayloadProduct,
	isPayloadSimulation,
	payloadDocumentValidator,
	payloadListValidator,
	type PayloadProduct,
	type PayloadSimulation
} from '$lib/server/payload/types';
import {
	defaultSimulationCreateValues,
	simulationCreateInputFromFormData,
	validateSimulationCreateForm
} from '$lib/validation/forms';

export async function getSimulationCreateData(
	fetch: typeof globalThis.fetch,
	token: string,
	selectedProductId?: number
): Promise<SimulationCreateViewModel> {
	if (isFrontendMockMode()) return getMockSimulationCreateData(selectedProductId);

	const products = await payloadRequest({
		fetch,
		path: '/api/products',
		query: {
			depth: 0,
			limit: 100,
			sort: 'name',
			where: { status: { not_equals: 'archived' } }
		},
		token,
		validate: payloadListValidator<PayloadProduct>(isPayloadProduct)
	});

	return {
		productOptions: mapSimulationProductOptions(products.docs),
		values: {
			...defaultSimulationCreateValues,
			product: selectedProductId ? String(selectedProductId) : ''
		}
	};
}

async function findAccessibleProduct(
	fetch: typeof globalThis.fetch,
	token: string,
	productId: number
): Promise<PayloadProduct> {
	const response = await payloadRequest({
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
	const product = response.docs[0];

	if (!product) {
		throw new PayloadNotFoundError('Choose an accessible product before creating a simulation.');
	}

	return product;
}

export async function createSimulation(
	fetch: typeof globalThis.fetch,
	token: string,
	user: AuthenticatedUser,
	input: SimulationCreateInput
): Promise<{ id: string }> {
	const validation = validateSimulationCreateForm(input);
	if (validation.errors) {
		throw new PayloadValidationError(
			'Check the simulation configuration and try again.',
			validation.errors
		);
	}

	if (isFrontendMockMode()) {
		const product = getMockProductDetailData(validation.data.product);
		if (!product) {
			throw new PayloadNotFoundError('Choose an accessible product before creating a simulation.');
		}
		return { id: '101' };
	}

	const product = await findAccessibleProduct(fetch, token, validation.data.product);

	const response = await payloadRequest({
		body: {
			configuration: {
				additionalInstructions: validation.data.additionalInstructions,
				competitorContext: validation.data.competitorContext,
				customerSegments: validation.data.customerSegments.map((segment) => ({ segment })),
				marketConditions: validation.data.marketConditions,
				pricingStrategy: validation.data.pricingStrategy,
				simulationGoal: validation.data.simulationGoal
			},
			conversationCount: 0,
			currency: product.currency,
			customerCount: validation.data.customerCount,
			owner: user.id,
			product: product.id,
			status: 'draft',
			targetAudience: validation.data.targetAudience,
			targetLocation: validation.data.targetLocation,
			title: validation.data.title
		},
		fetch,
		method: 'POST',
		path: '/api/simulations',
		token,
		validate: payloadDocumentValidator<PayloadSimulation>(isPayloadSimulation)
	});

	return { id: String(response.doc.id) };
}

export function simulationCreateInputFromRequest(formData: FormData): SimulationCreateInput {
	return simulationCreateInputFromFormData(formData);
}
