// ABOUTME: Страница категории каталога — подкатегории и товары с фильтрацией.
// ABOUTME: Серверный компонент. Поддерживает searchParams: sort, inStock, minPrice, maxPrice.

import type { Metadata } from 'next'
import type { Where } from 'payload'

import { CategoryCard } from '@/components/CategoryCard'
import { FiltersSidebar } from '@/components/FiltersSidebar'
import { Grid } from '@/components/Grid'
import { ProductGridItem } from '@/components/ProductGridItem'
import configPromise from '@payload-config'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

type SearchParams = { [key: string]: string | string[] | undefined }

type Args = {
  params: Promise<{ slug: string }>
  searchParams: Promise<SearchParams>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })

  const category = result.docs[0]
  if (!category) return { title: 'Категория не найдена' }

  return {
    title: category.title,
    description: `${category.title} — купить по выгодной цене в интернет-магазине`,
  }
}

export default async function CategoryPage({ params, searchParams }: Args) {
  const { slug } = await params
  const { sort, inStock, minPrice, maxPrice } = await searchParams

  const payload = await getPayload({ config: configPromise })

  const categoryResult = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })

  const category = categoryResult.docs[0]
  if (!category) return notFound()

  // Подкатегории
  const subcategories = await payload.find({
    collection: 'categories',
    where: { parent: { equals: category.id } },
    sort: 'title',
    limit: 50,
    depth: 1,
  })

  // Собираем where-условия для товаров
  const productConditions: Where[] = [
    { _status: { equals: 'published' } },
    { categories: { contains: category.id } },
  ]

  if (inStock && typeof inStock === 'string') {
    productConditions.push({ inStock: { equals: inStock } })
  }

  if (minPrice && typeof minPrice === 'string') {
    const min = parseFloat(minPrice)
    if (!isNaN(min)) {
      productConditions.push({ priceInKZT: { greater_than_equal: min } })
    }
  }

  if (maxPrice && typeof maxPrice === 'string') {
    const max = parseFloat(maxPrice)
    if (!isNaN(max)) {
      productConditions.push({ priceInKZT: { less_than_equal: max } })
    }
  }

  const products = await payload.find({
    collection: 'products',
    where: { and: productConditions },
    sort: typeof sort === 'string' ? sort : 'title',
    limit: 40,
    depth: 1,
    select: {
      title: true,
      slug: true,
      gallery: true,
      categories: true,
      priceInKZT: true,
      inStock: true,
      rating: true,
    },
  })

  // Хлебные крошки
  const parentCategory =
    category.parent && typeof category.parent === 'object' ? category.parent : null

  return (
    <div className="container py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/catalog" className="hover:text-foreground transition-colors">
          Каталог
        </Link>
        {parentCategory && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link
              href={`/catalog/${parentCategory.slug}`}
              className="hover:text-foreground transition-colors"
            >
              {parentCategory.title}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">{category.title}</span>
      </nav>

      <h1 className="font-heading text-3xl font-bold mb-6">{category.title}</h1>

      {/* Подкатегории */}
      {subcategories.docs.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {subcategories.docs.map((sub) => (
              <CategoryCard key={sub.id} category={sub} />
            ))}
          </div>
        </div>
      )}

      {/* Фильтры + Товары */}
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full shrink-0 md:w-1/4">
          <FiltersSidebar />
        </aside>
        <main className="flex-1">
          {products.docs.length > 0 ? (
            <Grid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.docs.map((product) => (
                <ProductGridItem key={product.id} product={product} />
              ))}
            </Grid>
          ) : (
            <p className="text-muted-foreground">
              Товары не найдены. Попробуйте изменить фильтры.
            </p>
          )}
        </main>
      </div>
    </div>
  )
}
