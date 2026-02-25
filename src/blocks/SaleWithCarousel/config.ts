// ABOUTME: Конфигурация блока «Большая акция + карусель товаров».
// ABOUTME: Промо-баннер слева, карусель товаров справа.

import type { Block } from 'payload'

export const SaleWithCarousel: Block = {
  slug: 'saleWithCarousel',
  labels: { singular: 'Акция с каруселью', plural: 'Акции с каруселями' },
  fields: [
    {
      name: 'promotion',
      type: 'relationship',
      relationTo: 'promotions',
      required: true,
      label: 'Промо-акция (баннер)',
    },
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'collection',
      options: [
        { label: 'По категории', value: 'collection' },
        { label: 'Вручную', value: 'selection' },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Категория товаров',
      admin: { condition: (_, s) => s.populateBy === 'collection' },
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      label: 'Товары',
      admin: { condition: (_, s) => s.populateBy === 'selection' },
    },
    { name: 'limit', type: 'number', defaultValue: 8, label: 'Лимит товаров' },
  ],
}
