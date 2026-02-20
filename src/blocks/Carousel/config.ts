import type { Block } from 'payload'

export const Carousel: Block = {
  slug: 'carousel',
  fields: [
    {
      name: 'populateBy',
      label: 'Заполнить по',
      type: 'select',
      defaultValue: 'collection',
      options: [
        {
          label: 'Коллекция',
          value: 'collection',
        },
        {
          label: 'Индивидуальный выбор',
          value: 'selection',
        },
      ],
    },
    {
      name: 'relationTo',
      type: 'select',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      defaultValue: 'products',
      label: 'Коллекции для отображения',
      options: [
        {
          label: 'Товары',
          value: 'products',
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      hasMany: true,
      label: 'Категории для отображения',
      relationTo: 'categories',
    },
    {
      name: 'limit',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        step: 1,
      },
      defaultValue: 10,
      label: 'Лимит',
    },
    {
      name: 'selectedDocs',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'selection',
      },
      hasMany: true,
      label: 'Выбор',
      relationTo: ['products'],
    },
    {
      name: 'populatedDocs',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        description: 'This field is auto-populated after-read',
        disabled: true,
      },
      hasMany: true,
      label: 'Заполненные документы',
      relationTo: ['products'],
    },
    {
      name: 'populatedDocsTotal',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        description: 'This field is auto-populated after-read',
        disabled: true,
        step: 1,
      },
      label: 'Всего заполненных документов',
    },
  ],
  interfaceName: 'CarouselBlock',
  labels: {
    plural: 'Карусели',
    singular: 'Карусель',
  },
}
