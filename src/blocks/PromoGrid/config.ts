// ABOUTME: Конфигурация блока сетки промо-баннеров «Все акции».
// ABOUTME: Отображает 3 промо-карточки из коллекции Promotions (type=sale).

import type { Block } from 'payload'

export const PromoGrid: Block = {
  slug: 'promoGrid',
  labels: { singular: 'Сетка акций', plural: 'Сетки акций' },
  fields: [
    { name: 'title', type: 'text', defaultValue: 'Все акции в одном месте', label: 'Заголовок' },
    {
      name: 'promotions',
      type: 'relationship',
      relationTo: 'promotions',
      hasMany: true,
      maxRows: 4,
      label: 'Промо-акции (пусто = все активные sale)',
    },
  ],
}
