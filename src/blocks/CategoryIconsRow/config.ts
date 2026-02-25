// ABOUTME: Конфигурация блока горизонтального ряда иконок категорий.
// ABOUTME: Отображает корневые категории с маленькими иконками для быстрой навигации.

import type { Block } from 'payload'

export const CategoryIconsRow: Block = {
  slug: 'categoryIconsRow',
  labels: { singular: 'Ряд иконок категорий', plural: 'Ряды иконок категорий' },
  fields: [
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: 'Категории (пусто = все корневые)',
    },
  ],
}
