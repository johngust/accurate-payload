// ABOUTME: Коллекция «Товаров дня» — компактные карточки со скидкой.
// ABOUTME: Привязываются к категориям для показа на разных страницах.

import type { CollectionConfig } from 'payload'

export const FeaturedProducts: CollectionConfig = {
  slug: 'featuredProducts',
  labels: { singular: 'Товар дня', plural: 'Товары дня' },
  access: { read: () => true },
  admin: { useAsTitle: 'title', group: 'Промо' },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Заголовок', defaultValue: 'Товар дня' },
    { name: 'product', type: 'relationship', relationTo: 'products', required: true, label: 'Товар' },
    { name: 'discountPercent', type: 'number', min: 1, max: 99, label: 'Скидка %' },
    { name: 'active', type: 'checkbox', defaultValue: true, label: 'Активен' },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: 'Категории (пусто = глобальный)',
    },
  ],
}
