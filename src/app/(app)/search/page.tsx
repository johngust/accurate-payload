// ABOUTME: Страница глобального поиска товаров по названию и характеристикам.
// ABOUTME: Поддерживает пагинацию и фильтрацию результатов.

import type { Metadata } from 'next'
import type { Where } from 'payload'

import { Grid } from '@/components/Grid'
import { ProductGridItem } from '@/components/ProductGridItem'
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
  const { q } = await searchParams

  if (!q || typeof q !== 'string') {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Введите запрос для поиска</h1>
        <p className="text-muted-foreground">Например: "смеситель для ванны"</p>
      </div>
    )
  }

  const payload = await getPayload({ config: configPromise })

  const products = await payload.find({
    collection: 'products',
    where: {
      or: [
        { title: { contains: q } },
        { 'specs.value': { contains: q } },
        { slug: { contains: q } },
      ],
      _status: { equals: 'published' },
    },
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
      <h1 className="font-heading text-3xl font-bold mb-6">
        Результаты поиска: <span className="text-primary italic">"{q}"</span>
      </h1>

      <p className="mb-8 text-muted-foreground">Найдено товаров: {products.totalDocs}</p>

      {products.docs.length > 0 ? (
        <Grid className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
    </div>
  )
}
