// ABOUTME: Компактная карточка «Товар дня» со скидкой для Hero-секции.
// ABOUTME: Показывает товар, процент скидки и зачёркнутую старую цену.

import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import type { FeaturedProduct } from '@/payload-types'
import Link from 'next/link'

type Props = {
  featured: FeaturedProduct
}

export const FeaturedProductCard: React.FC<Props> = ({ featured }) => {
  const product = typeof featured.product === 'object' ? featured.product : null
  if (!product) return null

  const image =
    product.gallery?.[0]?.image && typeof product.gallery[0].image === 'object'
      ? product.gallery[0].image
      : undefined

  const price = product.priceInUSD
  const oldPrice =
    featured.discountPercent && price
      ? Math.round(price / (1 - featured.discountPercent / 100))
      : undefined

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/products/${product.slug}`} className="absolute inset-0 z-10">
        <span className="sr-only">View {product.title}</span>
      </Link>

      <div className="relative mb-2 flex items-center justify-between">
        <span className="font-heading text-sm font-bold text-primary">{featured.title}</span>
        {featured.discountPercent && (
          <span className="relative z-20 rounded-full bg-destructive px-2.5 py-0.5 text-xs font-bold text-white">
            -{featured.discountPercent}%
          </span>
        )}
      </div>

      <div className="relative mb-3 flex w-full flex-1 flex-col">
        <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg">
          {image && (
            <Media
              resource={image}
              imgClassName="absolute inset-0 h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
          )}
        </div>
        <h3 className="mb-2 line-clamp-2 text-sm font-medium transition-colors duration-200 group-hover:text-primary">
          {product.title}
        </h3>
      </div>

      <div className="mt-auto flex items-baseline gap-2">
        {typeof price === 'number' && (
          <span className="font-heading text-xl font-bold">
            <Price amount={price} />
          </span>
        )}
        {oldPrice && (
          <span className="text-sm text-muted-foreground line-through">
            <Price amount={oldPrice} />
          </span>
        )}
      </div>
    </div>
  )
}
