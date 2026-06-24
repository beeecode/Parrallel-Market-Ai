import type { UserRole } from '@parallel-market-ai/shared-types'
import type { PayloadRequest } from 'payload'

export type AppUser = {
  id: number | string
  role?: UserRole | null
  isActive?: boolean | null
}

export function getAppUser(req: PayloadRequest): AppUser | null {
  return (req.user as AppUser | null | undefined) ?? null
}

export function isActiveUser(user: AppUser | null | undefined): user is AppUser {
  return Boolean(user && user.isActive !== false)
}

export function hasRole(user: AppUser | null | undefined, roles: UserRole[]): boolean {
  return isActiveUser(user) && Boolean(user.role && roles.includes(user.role))
}

export function isAdmin(user: AppUser | null | undefined): boolean {
  return hasRole(user, ['admin'])
}

export function isStaff(user: AppUser | null | undefined): boolean {
  return hasRole(user, ['admin', 'analyst'])
}

export function relationID(value: unknown): number | string | null {
  if (typeof value === 'number' || typeof value === 'string') {
    return value
  }

  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    return typeof id === 'number' || typeof id === 'string' ? id : null
  }

  if (value && typeof value === 'object' && 'value' in value) {
    return relationID((value as { value?: unknown }).value)
  }

  return null
}
