// ABOUTME: Конфигурация блока сервисных карточек (рассрочка, установка, доставка).
// ABOUTME: 3 горизонтальные карточки с иконкой, заголовком и описанием.

import type { Block } from 'payload'

export const ServiceCards: Block = {
  slug: 'serviceCards',
  labels: { singular: 'Сервисные карточки', plural: 'Сервисные карточки' },
  fields: [
    {
      name: 'cards',
      type: 'array',
      maxRows: 4,
      fields: [
        { name: 'iconName', type: 'text', required: true, label: 'Иконка (Lucide)' },
        { name: 'title', type: 'text', required: true, label: 'Заголовок' },
        { name: 'description', type: 'text', label: 'Описание' },
        {
          name: 'link',
          type: 'group',
          fields: [{ name: 'url', type: 'text', label: 'URL' }],
        },
      ],
    },
  ],
}
