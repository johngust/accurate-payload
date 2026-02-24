import type { Product } from '@/payload-types'

import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Star } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type Props = {
  product: Partial<Product>
}

export const ProductGridItem: React.FC<Props> = ({ product }) => {
  const { gallery, priceInUSD, title, rating, inStock } = product

  let price = priceInUSD

  const variants = product.variants?.docs

  if (variants && variants.length > 0) {
    const variant = variants[0]
    if (
      variant &&
      typeof variant === 'object' &&
      variant?.priceInUSD &&
      typeof variant.priceInUSD === 'number'
    ) {
      price = variant.priceInUSD
    }
  }

  const image =
    gallery?.[0]?.image && typeof gallery[0]?.image !== 'string' ? gallery[0]?.image : undefined

  return (
    <div className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-lg">
      <Link href={`/products/${product.slug}`} className="relative mb-4 block aspect-square w-full">
        {image && (
          <Media
            className="relative h-full w-full"
            imgClassName="absolute inset-0 h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            resource={image}
          />
        )}
      </Link>

      <div className="flex flex-1 flex-col">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          {rating?.value ? (
            <div className="flex items-center gap-1 text-warning">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="font-semibold text-foreground">{rating.value}</span>
              <span className="text-muted-foreground">({rating.count || 0})</span>
            </div>
          ) : (
            <span />
          )}

          {inStock === 'in_stock' && <span className="text-success font-medium">В наличии</span>}
          {inStock === 'preorder' && <span className="text-warning font-medium">Под заказ</span>}
          {inStock === 'out_of_stock' && <span className="text-destructive font-medium">Нет в наличии</span>}
        </div>

        <Link href={`/products/${product.slug}`} className="mb-4">
          <h3 className="line-clamp-2 font-heading text-sm font-medium leading-tight text-foreground transition-colors hover:text-primary sm:text-base">
            {title}
          </h3>
        </Link>

        <div className="mt-auto flex items-end justify-between gap-4">
          <div className="flex flex-col">
            {typeof price === 'number' && (
              <span className="font-heading text-xl font-bold">
                <Price amount={price} />
              </span>
            )}
          </div>

          <Button asChild size="icon" className="h-10 w-10 shrink-0 rounded-full transition-colors">
            <Link href={`/products/${product.slug}`}>
              <ShoppingCart className="h-4 w-4" />
              <span className="sr-only">Подробнее</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
