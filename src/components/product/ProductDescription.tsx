'use client'
import type { Product, Variant } from '@/payload-types'

import { AddToCart } from '@/components/Cart/AddToCart'
import { Price } from '@/components/Price'
import { RichText } from '@/components/RichText'
import { Star } from 'lucide-react'
import { Suspense } from 'react'

import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import { VariantSelector } from './VariantSelector'

export function ProductDescription({ product }: { product: Product }) {
  const { currency } = useCurrency()
  let amount = 0,
    lowestAmount = 0,
    highestAmount = 0
  const priceField = `priceIn${currency.code}` as keyof Product
  const hasVariants = product.enableVariants && Boolean(product.variants?.docs?.length)

  if (hasVariants) {
    const priceField = `priceIn${currency.code}` as keyof Variant
    const variantsOrderedByPrice = product.variants?.docs
      ?.filter((variant) => variant && typeof variant === 'object')
      .sort((a, b) => {
        if (
          typeof a === 'object' &&
          typeof b === 'object' &&
          priceField in a &&
          priceField in b &&
          typeof a[priceField] === 'number' &&
          typeof b[priceField] === 'number'
        ) {
          return a[priceField] - b[priceField]
        }
        return 0
      }) as Variant[]

    if (variantsOrderedByPrice.length > 0) {
      const lowestVariant = variantsOrderedByPrice[0][priceField]
      const highestVariant = variantsOrderedByPrice[variantsOrderedByPrice.length - 1][priceField]
      if (typeof lowestVariant === 'number' && typeof highestVariant === 'number') {
        lowestAmount = lowestVariant
        highestAmount = highestVariant
      }
    }
  } else if (product[priceField] && typeof product[priceField] === 'number') {
    amount = product[priceField]
  }

  const { rating, sku, specs, inStock } = product

  return (
    <div className="flex flex-col gap-8 rounded-2xl bg-card p-6 shadow-sm border border-border">
      {/* Title & SKU */}
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          {sku && <span>Артикул: {sku}</span>}
          {rating?.value ? (
            <div className="flex items-center gap-1 text-warning">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-semibold text-foreground">{rating.value}</span>
              <span className="text-muted-foreground">({rating.count || 0} отзывов)</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Нет отзывов</span>
          )}
        </div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {product.title}
        </h1>
      </div>

      <hr className="border-border" />

      {/* Price & Action Block */}
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center rounded-xl bg-secondary/30 p-6">
        <div className="flex flex-col gap-2">
          {inStock === 'in_stock' && <span className="text-sm font-medium text-success">В наличии</span>}
          {inStock === 'preorder' && <span className="text-sm font-medium text-warning">Под заказ</span>}
          {inStock === 'out_of_stock' && <span className="text-sm font-medium text-destructive">Нет в наличии</span>}

          <div className="font-heading text-3xl font-bold text-primary">
            {hasVariants ? (
              <Price highestAmount={highestAmount} lowestAmount={lowestAmount} />
            ) : (
              <Price amount={amount} />
            )}
          </div>
        </div>

        <div className="w-full sm:w-auto min-w-[200px]">
          <Suspense fallback={null}>
            <AddToCart product={product} />
          </Suspense>
        </div>
      </div>

      {hasVariants && (
        <>
          <Suspense fallback={null}>
            <VariantSelector product={product} />
          </Suspense>
          <hr className="border-border" />
        </>
      )}

      {/* Description */}
      {product.description && (
        <div>
          <h3 className="mb-4 font-heading text-xl font-bold">О товаре</h3>
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground">
            <RichText data={product.description} enableGutter={false} />
          </div>
        </div>
      )}

      {/* Specs */}
      {specs && specs.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-4 font-heading text-xl font-bold">Характеристики</h3>
          <dl className="flex border-t border-border flex-col divide-y divide-border text-sm md:text-base">
            {specs.map((spec, i) => (
              <div key={i} className="flex justify-between py-3">
                <dt className="text-muted-foreground w-1/2 pr-4">{spec.key}</dt>
                <dd className="font-medium text-foreground w-1/2 text-right">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}

