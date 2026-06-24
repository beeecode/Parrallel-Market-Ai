import type { Block } from 'payload'

import { requiredText } from '../lib/validation'

export const HeroBlock: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: {
    singular: 'Hero',
    plural: 'Heroes',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      validate: requiredText('Hero heading', 160),
    },
    {
      name: 'description',
      type: 'textarea',
      validate: requiredText('Hero description', 600),
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'primaryAction',
      type: 'group',
      fields: [
        {
          name: 'label',
          type: 'text',
        },
        {
          name: 'href',
          type: 'text',
        },
      ],
    },
  ],
}
