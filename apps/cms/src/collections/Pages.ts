import type { CollectionConfig } from 'payload'

import { adminOrAnalyst, adminsOnly, publishedOrAuthenticated } from '../access'
import { ContentBlock, FeatureGridBlock, HeroBlock } from '../blocks'
import { auditFields, slugField } from '../fields'
import { assignOwner, auditUser, generateSlug } from '../hooks'
import { collectionSlugs } from '../lib/collectionSlugs'
import { requiredText } from '../lib/validation'

export const Pages: CollectionConfig = {
  slug: collectionSlugs.pages,
  labels: {
    singular: 'Page',
    plural: 'Pages',
  },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'author', 'publishedAt', 'updatedAt'],
  },
  access: {
    create: adminOrAnalyst,
    delete: adminsOnly,
    read: publishedOrAuthenticated,
    update: adminOrAnalyst,
  },
  hooks: {
    beforeValidate: [generateSlug('title')],
    beforeChange: [assignOwner('author'), auditUser],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      validate: requiredText('Title', 180),
    },
    slugField(),
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      required: true,
    },
    {
      name: 'metaTitle',
      type: 'text',
      maxLength: 180,
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      maxLength: 320,
    },
    {
      name: 'hero',
      type: 'blocks',
      blocks: [HeroBlock],
      maxRows: 1,
    },
    {
      name: 'contentBlocks',
      type: 'blocks',
      blocks: [ContentBlock, FeatureGridBlock],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: collectionSlugs.users,
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    ...auditFields,
  ],
}
