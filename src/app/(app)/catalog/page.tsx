// ABOUTME: Корневая страница каталога — сетка корневых категорий.
// ABOUTME: Серверный компонент, запрашивает категории без parent.

import type { Metadata } from 'next'

import { CategoryCard } from '@/components/CategoryCard'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const metadata: Metadata = {
  title: 'Каталог',
  description: 'Каталог товаров — выберите категорию',
}

export default async function CatalogPage() {
  const payload = await getPayload({ config: configPromise })

  const categories = await payload.find({
    collection: 'categories',
    where: {
      parent: {
        exists: false,
      },
    },
    sort: 'title',
    limit: 50,
    depth: 1,
  })

  return (
    <div className="container py-8">
      <h1 className="font-heading text-3xl font-bold mb-6">Каталог</h1>

      {categories.docs.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.docs.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Категории пока не добавлены.</p>
      )}
    </div>
  )
}
