// ABOUTME: Коллекция брендов с логотипами для отображения на главной и в каталоге.
// ABOUTME: Логотипы отображаются в горизонтальной сетке.

import type { CollectionConfig } from 'payload'

export const Brands: CollectionConfig = {
  slug: 'brands',
  labels: { singular: 'Бренд', plural: 'Бренды' },
  access: { read: () => true },
  admin: { useAsTitle: 'name', group: 'Контент' },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Название' },
    { name: 'logo', type: 'upload', relationTo: 'media', label: 'Логотип' },
    {
      name: 'link',
      type: 'group',
      fields: [
        { name: 'url', type: 'text', label: 'URL' },
      ],
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0, label: 'Порядок' },
  ],
}
