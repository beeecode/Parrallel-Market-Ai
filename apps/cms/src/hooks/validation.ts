import {
  validateRange,
  validateSentimentTotal,
} from '@parallel-market-ai/validation'
import { APIError } from 'payload'
import type { CollectionBeforeValidateHook, PayloadRequest } from 'payload'

import { collectionSlugs } from '../lib/collectionSlugs'
import { relationID } from '../lib/auth'

function assertValid(result: { valid: boolean; error?: string }): void {
  if (!result.valid) {
    throw new APIError(result.error ?? 'Invalid data.', 400)
  }
}

export const validateSimulation: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) {
    return data
  }

  assertValid(validateRange(data.revenueMinimum, data.revenueMaximum, 'Revenue'))

  if (data.status === 'completed' && !data.completedAt) {
    throw new APIError('Completed simulations require a completion date.', 400)
  }

  return data
}

export const validateReport: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) {
    return data
  }

  assertValid(
    validateSentimentTotal([
      data.positiveSentiment,
      data.neutralSentiment,
      data.negativeSentiment,
    ]),
  )
  assertValid(
    validateRange(data.optimalPriceMinimum, data.optimalPriceMaximum, 'Optimal price'),
  )
  assertValid(validateRange(data.revenueMinimum, data.revenueMaximum, 'Revenue'))

  return data
}

async function getRelatedSimulationID(
  req: PayloadRequest,
  collection: 'conversations' | 'customer-agents',
  id: number | string,
): Promise<number | string | null> {
  const document = await req.payload.findByID({
    collection,
    id,
    depth: 0,
    overrideAccess: true,
    req,
  })

  return relationID(document.simulation)
}

export const validateConversationRelationships: CollectionBeforeValidateHook = async ({
  data,
  req,
}) => {
  if (!data) {
    return data
  }

  const simulationID = relationID(data.simulation)
  const agentID = relationID(data.customerAgent)

  if (simulationID == null || agentID == null) {
    return data
  }

  const agentSimulationID = await getRelatedSimulationID(
    req,
    collectionSlugs.customerAgents,
    agentID,
  )

  if (agentSimulationID !== simulationID) {
    throw new APIError('The selected customer agent does not belong to this simulation.', 400)
  }

  return data
}

export const validateMessageRelationships: CollectionBeforeValidateHook = async ({ data, req }) => {
  if (!data) {
    return data
  }

  const simulationID = relationID(data.simulation)
  const conversationID = relationID(data.conversation)
  const agentID = relationID(data.customerAgent)

  if (simulationID == null || conversationID == null) {
    return data
  }

  const conversationSimulationID = await getRelatedSimulationID(
    req,
    collectionSlugs.conversations,
    conversationID,
  )

  if (conversationSimulationID !== simulationID) {
    throw new APIError('The selected conversation does not belong to this simulation.', 400)
  }

  if (data.senderType === 'customer' && agentID == null) {
    throw new APIError('Customer messages require a customer agent.', 400)
  }

  if (agentID != null) {
    const agentSimulationID = await getRelatedSimulationID(
      req,
      collectionSlugs.customerAgents,
      agentID,
    )

    if (agentSimulationID !== simulationID) {
      throw new APIError('The selected customer agent does not belong to this simulation.', 400)
    }
  }

  return data
}
