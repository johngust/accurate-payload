import type { Block } from 'payload'

export const CategoriesGrid: Block = {
    slug: 'categoriesGrid',
    labels: {
        singular: 'Сетка категорий',
        plural: 'Сетки категорий',
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            label: 'Заголовок блока',
            defaultValue: 'Популярные категории',
        },
        {
            name: 'categories',
            type: 'relationship',
            relationTo: 'categories',
            hasMany: true,
            label: 'Категории для отображения',
            required: true,
        },
    ],
}
