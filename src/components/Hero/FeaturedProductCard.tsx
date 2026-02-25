// ABOUTME: Компактная карточка «Товар дня» со скидкой для Hero-секции.
// ABOUTME: Показывает товар, процент скидки и зачёркнутую старую цену.

import type { FeaturedProduct, Product } from '@/payload-types'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
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
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-heading text-sm font-bold text-primary">{featured.title}</span>
        {featured.discountPercent && (
          <span className="rounded-full bg-destructive px-2.5 py-0.5 text-xs font-bold text-white">
            -{featured.discountPercent}%
          </span>
        )}
      </div>

      <Link href={`/products/${product.slug}`} className="relative mb-3 block aspect-square w-full">
        {image && (
          <Media
            resource={image}
            imgClassName="absolute inset-0 h-full w-full object-contain"
          />
        )}
      </Link>

      <Link href={`/products/${product.slug}`}>
        <h3 className="mb-2 line-clamp-2 text-sm font-medium">{product.title}</h3>
      </Link>

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
