// ABOUTME: Серверный компонент подборки товаров по категориям.
// ABOUTME: Предзагружает товары первой категории, остальные подгружаются клиентом.

import type { Category, Product } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { TabsClient } from './Tabs.client'

type Props = {
  categories: (number | Category)[]
  limit?: number | null
}

export const CategoryProductTabsBlock: React.FC<Props> = async ({ categories, limit: limitProp }) => {
  const limit = limitProp ?? 4
  if (!categories?.length) return null

  const cats = categories
    .map((c: number | Category) => (typeof c === 'object' ? c : null))
    .filter(Boolean) as Category[]

  if (!cats.length) return null

  const payload = await getPayload({ config: configPromise })

  const firstCat = cats[0]
  const result = await payload.find({
    collection: 'products',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { categories: { contains: firstCat.id } },
      ],
    },
    limit,
    depth: 1,
    select: {
      title: true, slug: true, gallery: true,
      priceInUSD: true, inStock: true, rating: true,
    },
  })

  const tabsData = cats.map((cat) => ({
    id: cat.id,
    title: cat.title,
    slug: cat.slug,
  }))

  return (
    <section className="container py-8">
      <TabsClient
        tabs={tabsData}
        initialProducts={result.docs as Product[]}
        limit={limit}
      />
    </section>
  )
}
