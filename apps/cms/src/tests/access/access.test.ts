import type { PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import {
  adminOrAnalyst,
  adminsOnly,
  authenticated,
  businessOwnerOrAdmin,
  ownerManagedField,
  publishedOrAuthenticated,
  publicCreateOnly,
  staffOrOwner,
} from '../../access'

type TestUser = {
  id: number
  isActive: boolean
  role: 'admin' | 'analyst' | 'business-owner' | 'viewer'
}

function request(user: TestUser | null): PayloadRequest {
  return {
    user,
  } as unknown as PayloadRequest
}

function callAccess(
  access: (...args: never[]) => unknown,
  user: TestUser | null,
): unknown {
  return access({
    req: request(user),
  } as never)
}

const admin: TestUser = { id: 1, isActive: true, role: 'admin' }
const analyst: TestUser = { id: 2, isActive: true, role: 'analyst' }
const owner: TestUser = { id: 3, isActive: true, role: 'business-owner' }
const viewer: TestUser = { id: 4, isActive: true, role: 'viewer' }

describe('collection access helpers', () => {
  it('limits anonymous page reads to published documents', () => {
    expect(callAccess(publishedOrAuthenticated, null)).toEqual({
      status: {
        equals: 'published',
      },
    })
  })

  it('allows public custom-request creation without granting staff access', () => {
    expect(callAccess(publicCreateOnly, null)).toBe(true)
    expect(callAccess(adminOrAnalyst, null)).toBe(false)
  })

  it('constrains a business owner to owned products', () => {
    expect(callAccess(staffOrOwner(), owner)).toEqual({
      owner: {
        equals: owner.id,
      },
    })
  })

  it('prevents a business owner from managing another owner field', () => {
    expect(
      ownerManagedField({
        doc: {
          owner: owner.id,
        },
        req: request(owner),
      } as never),
    ).toBe(true)

    expect(
      ownerManagedField({
        doc: {
          owner: 999,
        },
        req: request(owner),
      } as never),
    ).toBe(false)
  })

  it('allows analysts to read staff-visible records but not owner-only creation', () => {
    expect(callAccess(staffOrOwner(), analyst)).toBe(true)
    expect(callAccess(businessOwnerOrAdmin, analyst)).toBe(false)
  })

  it('keeps viewers read-restricted and unable to create owner records', () => {
    expect(callAccess(staffOrOwner(), viewer)).toBe(false)
    expect(callAccess(businessOwnerOrAdmin, viewer)).toBe(false)
  })

  it('allows administrators through privileged helpers', () => {
    expect(callAccess(adminsOnly, admin)).toBe(true)
    expect(callAccess(adminOrAnalyst, admin)).toBe(true)
    expect(callAccess(staffOrOwner(), admin)).toBe(true)
  })

  it('denies inactive users regardless of role', () => {
    const inactiveAdmin = { ...admin, isActive: false }

    expect(callAccess(authenticated, inactiveAdmin)).toBe(false)
    expect(callAccess(adminsOnly, inactiveAdmin)).toBe(false)
    expect(callAccess(adminOrAnalyst, inactiveAdmin)).toBe(false)
  })

  it('prevents non-admin role escalation', () => {
    expect(callAccess(adminsOnly, owner)).toBe(false)
    expect(callAccess(adminsOnly, analyst)).toBe(false)
    expect(callAccess(adminsOnly, admin)).toBe(true)
  })
})
