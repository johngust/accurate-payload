import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Категория',
    plural: 'Категории',
  },
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Контент',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'image',
      label: 'Изображение',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'parent',
      label: 'Родительская категория',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'promptTemplate',
      label: 'Шаблон промпта для генерации картинок',
      type: 'textarea',
      admin: {
        description: 'Используйте [НАЗВАНИЕ ТОВАРА] как плейсхолдер. Пример: Студийное фото [НАЗВАНИЕ ТОВАРА], 8k, photorealistic',
      },
    },
    slugField({
      position: undefined,
    }),
  ],
}
