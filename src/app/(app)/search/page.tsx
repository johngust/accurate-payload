// ABOUTME: Страница глобального поиска товаров по названию и характеристикам.
// ABOUTME: Поддерживает пагинацию и фильтрацию результатов.

import type { Metadata } from 'next'
import type { Where } from 'payload'

import { Grid } from '@/components/Grid'
import { ProductGridItem } from '@/components/ProductGridItem'
import { FiltersSidebar } from '@/components/FiltersSidebar'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'

type SearchParams = { [key: string]: string | string[] | undefined }

type Args = {
  searchParams: Promise<SearchParams>
}

export async function generateMetadata({ searchParams }: Args): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Поиск: ${q}` : 'Поиск товаров',
  }
}

export default async function SearchPage({ searchParams }: Args) {
  const { q, sort, inStock, minPrice, maxPrice, brand } = await searchParams

  if (!q || typeof q !== 'string') {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Введите запрос для поиска</h1>
        <p className="text-muted-foreground">Например: &quot;смеситель для ванны&quot;</p>
      </div>
    )
  }

  const payload = await getPayload({ config: configPromise })

  // Базовые условия поиска
  const searchConditions: Where = {
    or: [
      { title: { contains: q } },
      { 'specs.value': { contains: q } },
      { slug: { contains: q } },
    ],
  }

  // Собираем where-условия для товаров
  const productConditions: Where[] = [
    { _status: { equals: 'published' } },
    searchConditions,
  ]

  if (inStock && typeof inStock === 'string') {
    productConditions.push({ inStock: { equals: inStock } })
  }

  if (brand && typeof brand === 'string') {
    const brandList = brand.split(',')
    productConditions.push({
      or: brandList.map(b => ({
        and: [
          {
            or: [
              { 'specs.key': { equals: 'Бренд' } },
              { 'specs.key': { equals: 'Производитель' } },
              { 'specs.key': { equals: 'Brand' } },
            ],
          },
          { 'specs.value': { equals: b } },
        ],
      })),
    } as any)
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
      specs: true, // Нужно для извлечения брендов
    },
  })

  // Извлекаем доступные бренды из результатов поиска (первые 40)
  const brandCounts = new Map<string, number>()
  products.docs.forEach(p => {
    p.specs?.forEach(s => {
      const key = s.key.toLowerCase().trim()
      if (key === 'бренд' || key === 'производитель' || key === 'brand') {
        const val = s.value.trim()
        brandCounts.set(val, (brandCounts.get(val) || 0) + 1)
      }
    })
  })

  const availableBrands = Array.from(brandCounts.entries())
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => a.title.localeCompare(b.title))

  return (
    <div className="container py-8">
      <h1 className="font-heading text-3xl font-bold mb-6">
        Результаты поиска: <span className="text-primary italic">&quot;{q}&quot;</span>
      </h1>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full shrink-0 md:w-1/4">
          <FiltersSidebar brands={availableBrands} />
        </aside>
        <main className="flex-1">
          <div className="mb-4 flex justify-between items-center text-sm text-muted-foreground">
            <p>Найдено товаров: {products.totalDocs}</p>
          </div>
          {products.docs.length > 0 ? (
            <Grid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.docs.map((product) => (
                <ProductGridItem key={product.id} product={product} />
              ))}
            </Grid>
          ) : (
            <div className="py-20 text-center bg-muted/30 rounded-lg">
              <p className="text-xl text-muted-foreground">К сожалению, ничего не найдено.</p>
              <p className="text-sm text-muted-foreground mt-2">Попробуйте использовать другие ключевые слова.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
