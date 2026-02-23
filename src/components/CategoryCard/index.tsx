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
      className="group relative flex h-40 w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-secondary p-4 text-center transition-all hover:-translate-y-1 hover:shadow-md hover:bg-secondary/80"
    >
      {image && (
        <div className="mb-2 h-16 w-16">
          <Media
            className="h-full w-full"
            imgClassName="h-full w-full object-contain"
            resource={image}
          />
        </div>
      )}
      <span className="font-heading text-sm font-medium tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-base">
        {category.title}
      </span>
      <div className="absolute bottom-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="flex items-center text-xs font-semibold uppercase tracking-wider text-primary">
          Перейти <ChevronRight className="ml-1 h-3 w-3" />
        </span>
      </div>
    </Link>
  )
}
