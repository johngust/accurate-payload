// ABOUTME: Конфигурация блока «Готовые решения» — карусель комплектов товаров.
// ABOUTME: Каждый комплект — карточка с изображением, названием и ценой.

import type { Block } from 'payload'

export const ProductSets: Block = {
  slug: 'productSets',
  labels: { singular: 'Готовые решения', plural: 'Готовые решения' },
  fields: [
    { name: 'title', type: 'text', defaultValue: 'Популярные готовые решения', label: 'Заголовок' },
    {
      name: 'sets',
      type: 'array',
      label: 'Комплекты',
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Название' },
        { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Изображение' },
        { name: 'price', type: 'number', label: 'Цена' },
        { name: 'link', type: 'group', fields: [{ name: 'url', type: 'text', label: 'URL' }] },
      ],
    },
  ],
}
