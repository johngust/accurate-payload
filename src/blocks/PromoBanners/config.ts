// ABOUTME: Конфигурация блока промо-баннеров в ряд (3-4 карточки).
// ABOUTME: Отображает промо-акции из коллекции Promotions.

import type { Block } from 'payload'

export const PromoBanners: Block = {
  slug: 'promoBanners',
  labels: { singular: 'Промо-баннеры', plural: 'Промо-баннеры' },
  fields: [
    {
      name: 'source',
      type: 'select',
      defaultValue: 'all_active',
      label: 'Источник',
      options: [
        { label: 'Все активные баннеры', value: 'all_active' },
        { label: 'Выбрать вручную', value: 'manual' },
      ],
    },
    {
      name: 'promotions',
      type: 'relationship',
      relationTo: 'promotions',
      hasMany: true,
      maxRows: 4,
      label: 'Промо-акции',
      admin: {
        condition: (_, siblingData) => siblingData.source === 'manual',
      },
    },
  ],
}
