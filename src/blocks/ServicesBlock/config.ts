import type { Block } from 'payload'

export const ServicesBlock: Block = {
    slug: 'servicesBlock',
    labels: {
        singular: 'Блок услуг',
        plural: 'Блоки услуг',
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            label: 'Заголовок',
            defaultValue: 'Дополнительные услуги',
        },
        {
            name: 'services',
            type: 'array',
            fields: [
                { name: 'iconName', type: 'text', label: 'Название иконки (Lucide)' },
                { name: 'title', type: 'text', label: 'Название услуги' },
                { name: 'description', type: 'text', label: 'Описание' }
            ]
        }
    ]
}
