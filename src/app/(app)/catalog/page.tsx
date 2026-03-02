// ABOUTME: Корневая страница каталога — сетка корневых категорий и общий список товаров с фильтрами.

import type { Metadata } from 'next'
import type { Where } from 'payload'

import { CategoryCard } from '@/components/CategoryCard'
import { FiltersSidebar } from '@/components/FiltersSidebar'
import { Grid } from '@/components/Grid'
import { ProductGridItem } from '@/components/ProductGridItem'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getCategoryFilters } from '@/utilities/getFilters'

type SearchParams = { [key: string]: string | string[] | undefined }

type Args = {
  searchParams: Promise<SearchParams>
}

export const metadata: Metadata = {
  title: 'Каталог товаров',
  description: 'Каталог всех товаров магазина — выберите категорию или используйте фильтры',
}

export default async function CatalogPage({ searchParams }: Args) {
  const { sort, inStock, minPrice, maxPrice, brand, category, q } = await searchParams
  const payload = await getPayload({ config: configPromise })

  // Получаем общие фильтры для всего магазина
  const { 
    brands: availableBrands, 
    minPrice: minPossiblePrice, 
    maxPrice: maxPossiblePrice,
    categoryCounts
  } = await getCategoryFilters()

  // Корневые категории
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

  // Собираем where-условия для товаров
  const productConditions: Where[] = [
    { _status: { equals: 'published' } },
  ]

  if (q && typeof q === 'string') {
    productConditions.push({
      or: [
        { title: { contains: q } },
        { 'specs.value': { contains: q } },
      ],
    })
  }

  if (category && typeof category === 'string') {
    const categorySlugs = category.split(',')
    const selectedCategoryDocs = await payload.find({
      collection: 'categories',
      where: { slug: { in: categorySlugs } },
      limit: 100,
      depth: 0,
    })
    const selectedCategoryIds = selectedCategoryDocs.docs.map((c) => c.id)
    if (selectedCategoryIds.length > 0) {
      productConditions.push({
        categories: { in: selectedCategoryIds },
      })
    }
  }

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
    })
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
    sort: typeof sort === 'string' ? sort : '-createdAt',
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

  return (
    <div className="container py-8">
      <h1 className="font-heading text-3xl font-bold mb-6">Каталог</h1>

      {/* Категории */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-muted-foreground uppercase tracking-wider text-sm">Категории</h2>
        {categories.docs.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.docs.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Категории пока не добавлены.</p>
        )}
      </div>

      <hr className="mb-12 border-gray-100" />

      {/* Фильтры + Товары */}
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full shrink-0 md:w-1/4">
          <FiltersSidebar 
            brands={availableBrands} 
            categories={categories.docs} 
            categoryCounts={categoryCounts}
            minPossiblePrice={minPossiblePrice}
            maxPossiblePrice={maxPossiblePrice}
          />
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
            <div className="py-20 text-center bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">
                Товары не найдены. Попробуйте изменить фильтры.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
