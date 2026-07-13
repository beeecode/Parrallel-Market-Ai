import type { ReportViewModel } from '$lib/types/report';
import { mapReport } from '$lib/server/mappers/report.mapper';
import { getMockReportData } from '$lib/server/mock/data';
import { isFrontendMockMode } from '$lib/server/mock/mode';
import { PayloadNotFoundError } from '$lib/server/payload/errors';
import { payloadRequest } from '$lib/server/payload/client';
import {
	isPayloadReport,
	isPayloadSimulation,
	payloadListValidator,
	type PayloadReport,
	type PayloadSimulation
} from '$lib/server/payload/types';

export async function getReportData(
	fetch: typeof globalThis.fetch,
	token: string,
	simulationId?: number
): Promise<ReportViewModel | null> {
	if (isFrontendMockMode()) return getMockReportData();

	const reportResponse = await payloadRequest({
		fetch,
		path: '/api/reports',
		query: {
			depth: 0,
			limit: 1,
			sort: '-generatedAt,-version',
			...(simulationId ? { where: { simulation: { equals: simulationId } } } : {})
		},
		token,
		validate: payloadListValidator<PayloadReport>(isPayloadReport)
	});
	const report = reportResponse.docs[0];

	if (!report) {
		if (simulationId) throw new PayloadNotFoundError('This simulation report could not be found.');
		return null;
	}

	const relatedSimulationId =
		typeof report.simulation === 'number' ? report.simulation : report.simulation.id;
	const simulationResponse = await payloadRequest({
		fetch,
		path: '/api/simulations',
		query: {
			depth: 0,
			limit: 1,
			where: { id: { equals: relatedSimulationId } }
		},
		token,
		validate: payloadListValidator<PayloadSimulation>(isPayloadSimulation)
	});
	const simulation = simulationResponse.docs[0];

	if (!simulation) {
		throw new PayloadNotFoundError('The simulation for this report could not be found.');
	}

	return mapReport(report, simulation);
}

export async function getReportById(
	fetch: typeof globalThis.fetch,
	token: string,
	reportId: number
): Promise<ReportViewModel> {
	if (isFrontendMockMode()) return getMockReportData();

	const reportResponse = await payloadRequest({
		fetch,
		path: '/api/reports',
		query: {
			depth: 0,
			limit: 1,
			where: { id: { equals: reportId } }
		},
		token,
		validate: payloadListValidator<PayloadReport>(isPayloadReport)
	});
	const report = reportResponse.docs[0];

	if (!report) {
		throw new PayloadNotFoundError('This simulation report could not be found.');
	}

	const relatedSimulationId =
		typeof report.simulation === 'number' ? report.simulation : report.simulation.id;
	const simulationResponse = await payloadRequest({
		fetch,
		path: '/api/simulations',
		query: {
			depth: 0,
			limit: 1,
			where: { id: { equals: relatedSimulationId } }
		},
		token,
		validate: payloadListValidator<PayloadSimulation>(isPayloadSimulation)
	});
	const simulation = simulationResponse.docs[0];

	if (!simulation) {
		throw new PayloadNotFoundError('The simulation for this report could not be found.');
	}

	return mapReport(report, simulation);
}
