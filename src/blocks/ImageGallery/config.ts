// ABOUTME: Конфигурация блока masonry-галереи изображений.
// ABOUTME: Используется для секции «Идеи для дома» на главной.

import type { Block } from 'payload'

export const ImageGallery: Block = {
  slug: 'imageGallery',
  labels: { singular: 'Галерея изображений', plural: 'Галереи изображений' },
  fields: [
    { name: 'title', type: 'text', defaultValue: 'Идеи для дома', label: 'Заголовок' },
    {
      name: 'images',
      type: 'array',
      label: 'Изображения',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Изображение',
        },
        { name: 'caption', type: 'text', label: 'Подпись' },
      ],
    },
  ],
}
