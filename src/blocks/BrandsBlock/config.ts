// ABOUTME: Конфигурация блока логотипов брендов.
// ABOUTME: Горизонтальная сетка логотипов из коллекции Brands.

import type { Block } from 'payload'

export const BrandsBlock: Block = {
  slug: 'brandsBlock',
  labels: { singular: 'Блок брендов', plural: 'Блоки брендов' },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Только оригинальные бренды',
      label: 'Заголовок',
    },
  ],
}
