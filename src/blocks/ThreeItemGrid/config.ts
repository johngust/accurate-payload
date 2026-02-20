import type { Block } from 'payload'

export const ThreeItemGrid: Block = {
  slug: 'threeItemGrid',
  fields: [
    {
      name: 'products',
      type: 'relationship',
      admin: {
        isSortable: true,
      },
      hasMany: true,
      label: 'Товары для показа',
      maxRows: 3,
      minRows: 3,
      relationTo: 'products',
    },
  ],
  interfaceName: 'ThreeItemGridBlock',
  labels: {
    plural: 'Сетки из трех элементов',
    singular: 'Сетка из трех элементов',
  },
}
