import type { Access, PayloadRequest } from 'payload'

import { collectionSlugs } from '../lib/collectionSlugs'
import {
  getAppUser,
  hasRole,
  isActiveUser,
  isAdmin,
  isStaff,
  relationID,
} from '../lib/auth'

async function ownsSimulation(req: PayloadRequest, simulationValue: unknown): Promise<boolean> {
  const user = getAppUser(req)
  const simulationID = relationID(simulationValue)

  if (!isActiveUser(user) || simulationID == null) {
    return false
  }

  const simulation = await req.payload.findByID({
    collection: collectionSlugs.simulations,
    id: simulationID,
    depth: 0,
    overrideAccess: true,
    req,
  })

  return relationID(simulation.owner) === user.id
}

export const relatedSimulationRead: Access = ({ req }) => {
  const user = getAppUser(req)

  if (!isActiveUser(user)) {
    return false
  }

  if (isStaff(user)) {
    return true
  }

  if (!hasRole(user, ['business-owner'])) {
    return false
  }

  return {
    'simulation.owner': {
      equals: user.id,
    },
  }
}

export const relatedSimulationCreate: Access = async ({ data, req }) => {
  const user = getAppUser(req)

  if (!isActiveUser(user)) {
    return false
  }

  if (isAdmin(user)) {
    return true
  }

  if (!hasRole(user, ['business-owner'])) {
    return false
  }

  return ownsSimulation(req, data?.simulation)
}

export const relatedSimulationUpdate: Access = ({ req }) => {
  const user = getAppUser(req)

  if (!isActiveUser(user)) {
    return false
  }

  if (isAdmin(user)) {
    return true
  }

  if (!hasRole(user, ['business-owner'])) {
    return false
  }

  return {
    'simulation.owner': {
      equals: user.id,
    },
  }
}

export const staffRelatedSimulationUpdate: Access = ({ req }) => {
  const user = getAppUser(req)

  if (!isActiveUser(user)) {
    return false
  }

  if (isStaff(user)) {
    return true
  }

  if (!hasRole(user, ['business-owner'])) {
    return false
  }

  return {
    'simulation.owner': {
      equals: user.id,
    },
  }
}
