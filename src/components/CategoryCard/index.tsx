// ABOUTME: Карточка категории с изображением и ссылкой на страницу категории.
// ABOUTME: Используется на странице каталога и в блоке categoriesGrid.

import type { Category } from '@/payload-types'

import { Media } from '@/components/Media'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type Props = {
  category: Pick<Category, 'title' | 'slug' | 'image'>
}

export const CategoryCard: React.FC<Props> = ({ category }) => {
  const image =
    category.image && typeof category.image === 'object' ? category.image : undefined

  return (
    <Link
      href={`/catalog/${category.slug}`}
      className="group flex w-full flex-col items-center justify-center rounded-lg border border-gray-100 bg-white p-6 text-center transition-all hover:border-primary/20 hover:shadow-lg"
    >
      <div className="relative mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-50 transition-colors group-hover:bg-primary/5">
        {image ? (
          <Media
            className="h-16 w-16"
            imgClassName="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
            resource={image}
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-gray-200" />
        )}
      </div>
      <span className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary sm:text-base line-clamp-2">
        {category.title}
      </span>
    </Link>
  )
}
