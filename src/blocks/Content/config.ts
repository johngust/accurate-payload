import { link } from '@/fields/link'
import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { Block, Field } from 'payload'

const columnFields: Field[] = [
  {
    name: 'size',
    label: 'Размер',
    type: 'select',
    defaultValue: 'oneThird',
    options: [
      {
        label: 'Одна треть',
        value: 'oneThird',
      },
      {
        label: 'Половина',
        value: 'half',
      },
      {
        label: 'Две трети',
        value: 'twoThirds',
      },
      {
        label: 'Полная ширина',
        value: 'full',
      },
    ],
  },
  {
    name: 'richText',
    label: 'Текст',
    type: 'richText',
    editor: lexicalEditor({
      features: ({ rootFeatures }) => {
        return [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ]
      },
    }),
  },
  {
    name: 'enableLink',
    label: 'Включить ссылку',
    type: 'checkbox',
  },
  link({
    overrides: {
      admin: {
        condition: (_: unknown, { enableLink }: { enableLink?: boolean }) => Boolean(enableLink),
      },
    },
  }),
]

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  fields: [
    {
      name: 'columns',
      label: 'Колонки',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: columnFields,
    },
  ],
}
