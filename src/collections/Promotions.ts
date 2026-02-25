// ABOUTME: Коллекция промо-баннеров для слайдеров, акций и промо-сеток.
// ABOUTME: Переиспользуется на главной, в категориях и других страницах.

import type { CollectionConfig } from 'payload'

export const Promotions: CollectionConfig = {
  slug: 'promotions',
  labels: { singular: 'Промо-акция', plural: 'Промо-акции' },
  access: { read: () => true },
  admin: { useAsTitle: 'title', group: 'Промо' },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Заголовок' },
    { name: 'subtitle', type: 'text', label: 'Подзаголовок' },
    { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Изображение' },
    {
      name: 'link',
      type: 'group',
      fields: [
        { name: 'url', type: 'text', label: 'URL' },
        { name: 'label', type: 'text', label: 'Текст кнопки' },
      ],
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'banner',
      label: 'Тип',
      options: [
        { label: 'Hero-слайд', value: 'hero' },
        { label: 'Баннер', value: 'banner' },
        { label: 'Акция', value: 'sale' },
      ],
    },
    { name: 'active', type: 'checkbox', defaultValue: true, label: 'Активна' },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: 'Категории (пусто = глобальная)',
    },
  ],
}
