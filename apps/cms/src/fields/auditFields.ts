import type { Field } from 'payload'

export const auditFields: Field[] = [
  {
    name: 'createdBy',
    type: 'relationship',
    relationTo: 'users',
    admin: {
      hidden: true,
      readOnly: true,
    },
  },
  {
    name: 'updatedBy',
    type: 'relationship',
    relationTo: 'users',
    admin: {
      hidden: true,
      readOnly: true,
    },
  },
]
