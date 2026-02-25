// ABOUTME: Серверный компонент Hero-секции — промо-слайдер + товар дня.
// ABOUTME: Автоматически тянет данные из коллекций Promotions и FeaturedProducts.

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { PromoSlider } from './PromoSlider.client'
import { FeaturedProductCard } from './FeaturedProductCard'

type Props = {
  categoryId?: number
}

export const Hero: React.FC<Props> = async ({ categoryId }) => {
  const payload = await getPayload({ config: configPromise })

  const promoWhere: any = {
    and: [
      { active: { equals: true } },
      { type: { equals: 'hero' } },
    ],
  }
  if (categoryId) {
    promoWhere.and.push({ categories: { contains: categoryId } })
  } else {
    promoWhere.and.push({
      or: [
        { categories: { exists: false } },
        { 'categories.length': { equals: 0 } },
      ],
    })
  }

  const [promotions, featuredProducts] = await Promise.all([
    payload.find({
      collection: 'promotions',
      where: promoWhere,
      limit: 6,
      depth: 1,
    }),
    payload.find({
      collection: 'featuredProducts',
      where: { active: { equals: true } },
      limit: 1,
      depth: 2,
    }),
  ])

  if (!promotions.docs.length && !featuredProducts.docs.length) return null

  const featured = featuredProducts.docs[0]

  return (
    <section className="container pb-6 pt-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <PromoSlider promotions={promotions.docs} />
        {featured && <FeaturedProductCard featured={featured} />}
      </div>
    </section>
  )
}
