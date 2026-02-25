// ABOUTME: Конфигурация блока подборки товаров по категориям с табами.
// ABOUTME: Переключение табов показывает товары из выбранной категории.

import type { Block } from 'payload'

export const CategoryProductTabs: Block = {
  slug: 'categoryProductTabs',
  labels: { singular: 'Подборка по категориям', plural: 'Подборки по категориям' },
  fields: [
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      required: true,
      label: 'Категории (табы)',
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 4,
      label: 'Товаров на таб',
      admin: { step: 1 },
    },
  ],
}
