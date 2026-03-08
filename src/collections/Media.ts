import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const Media: CollectionConfig = {
  admin: {
    group: 'Контент',
  },
  labels: {
    singular: 'Медиафайл',
    plural: 'Медиафайлы',
  },
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'bitrixId',
      label: 'ID в Bitrix',
      type: 'number',
      index: true,
      admin: {
        description: 'Используется для дедупликации загрузок из Bitrix',
      },
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: true,
}
