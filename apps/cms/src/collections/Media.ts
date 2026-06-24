import path from 'path'
import type { CollectionConfig } from 'payload'
import { fileURLToPath } from 'url'

import { adminOrOwner, authenticated, publicRead } from '../access'
import { assignOwner } from '../hooks'
import { collectionSlugs } from '../lib/collectionSlugs'
import { requiredText } from '../lib/validation'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const Media: CollectionConfig = {
  slug: collectionSlugs.media,
  labels: {
    singular: 'Media',
    plural: 'Media',
  },
  admin: {
    group: 'Content',
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'alt', 'category', 'uploadedBy', 'updatedAt'],
    description: 'Local uploads are for development only. Production storage is configured later.',
  },
  access: {
    create: authenticated,
    delete: adminOrOwner('uploadedBy'),
    read: publicRead,
    update: adminOrOwner('uploadedBy'),
  },
  hooks: {
    beforeChange: [assignOwner('uploadedBy')],
  },
  upload: {
    staticDir: path.resolve(dirname, '../../media'),
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 320,
        height: 320,
        position: 'centre',
      },
      {
        name: 'card',
        width: 960,
        height: 640,
        position: 'centre',
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      validate: requiredText('Alt text', 240),
    },
    {
      name: 'caption',
      type: 'textarea',
      maxLength: 1_000,
    },
    {
      name: 'category',
      type: 'select',
      defaultValue: 'general',
      index: true,
      options: [
        { label: 'Avatar', value: 'avatar' },
        { label: 'Product', value: 'product' },
        { label: 'Page', value: 'page' },
        { label: 'Report', value: 'report' },
        { label: 'General', value: 'general' },
      ],
      required: true,
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: collectionSlugs.users,
      index: true,
      required: true,
      admin: {
        readOnly: true,
      },
    },
  ],
}
