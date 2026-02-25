// ABOUTME: Схема глобала Footer — навигационные колонки со ссылками и контактная информация.
// ABOUTME: Поддерживает до 4 колонок с заголовком и списком ссылок, а также телефон и email.

import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
    },
    {
      name: 'columns',
      type: 'array',
      maxRows: 4,
      label: 'Колонки',
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Заголовок колонки' },
        {
          name: 'links',
          type: 'array',
          label: 'Ссылки',
          fields: [
            { name: 'label', type: 'text', required: true, label: 'Текст ссылки' },
            { name: 'url', type: 'text', required: true, label: 'URL' },
          ],
        },
      ],
    },
    {
      name: 'contactPhone',
      type: 'text',
      label: 'Телефон',
    },
    {
      name: 'contactEmail',
      type: 'text',
      label: 'Email',
    },
  ],
}
