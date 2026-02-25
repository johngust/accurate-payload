// ABOUTME: Блок «Большая акция + карусель товаров».
// ABOUTME: Слева промо-баннер 40%, справа сетка товаров 60%.

import type { Product, Promotion } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { Media } from '@/components/Media'
import { ProductGridItem } from '@/components/ProductGridItem'

type Props = {
  promotion: number | Promotion
  populateBy?: string | null
  category?: number | any | null
  products?: (number | Product)[] | null
  limit?: number | null
}

export const SaleWithCarouselBlock: React.FC<Props> = async (props) => {
  const { promotion, populateBy, category, products: selectedProducts, limit = 8 } = props

  const promo = typeof promotion === 'object' ? promotion : null
  if (!promo) return null

  const payload = await getPayload({ config: configPromise })
  let productDocs: Product[] = []

  if (populateBy === 'selection' && selectedProducts?.length) {
    productDocs = selectedProducts
      .map((p) => (typeof p === 'object' ? p : null))
      .filter(Boolean) as Product[]
  } else if (category) {
    const catId = typeof category === 'object' ? category.id : category
    const result = await payload.find({
      collection: 'products',
      where: {
        and: [{ _status: { equals: 'published' } }, { categories: { contains: catId } }],
      },
      limit: limit ?? 8,
      depth: 1,
    })
    productDocs = result.docs
  }

  const image = typeof promo.image === 'object' ? promo.image : undefined

  return (
    <section className="container py-8">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_3fr]">
        {/* Промо-баннер */}
        <Link
          href={promo.link?.url || '#'}
          className="group relative flex aspect-[3/4] items-end overflow-hidden rounded-2xl lg:aspect-auto"
        >
          {image && (
            <Media
              resource={image}
              imgClassName="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="relative p-6 text-white">
            <h2 className="text-2xl font-bold">{promo.title}</h2>
            {promo.subtitle && <p className="mt-1 opacity-90">{promo.subtitle}</p>}
            {promo.link?.label && (
              <span className="mt-3 inline-block rounded-lg bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                {promo.link.label}
              </span>
            )}
          </div>
        </Link>

        {/* Сетка товаров */}
        {productDocs.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {productDocs.slice(0, 4).map((product) => (
              <ProductGridItem key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
