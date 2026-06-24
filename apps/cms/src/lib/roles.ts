import type { UserRole } from '@parallel-market-ai/shared-types'

export const userRoles: Array<{ label: string; value: UserRole }> = [
  { label: 'Administrator', value: 'admin' },
  { label: 'Analyst', value: 'analyst' },
  { label: 'Business Owner', value: 'business-owner' },
  { label: 'Viewer', value: 'viewer' },
]

export const staffRoles: UserRole[] = ['admin', 'analyst']
