'use client'
import type { Product, Variant } from '@/payload-types'

import { AddToCart } from '@/components/Cart/AddToCart'
import { Price } from '@/components/Price'
import { RichText } from '@/components/RichText'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import { Suspense } from 'react'
import { cn } from '@/utilities/cn'

import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import { VariantSelector } from './VariantSelector'

import Link from 'next/link'

export function ProductDescription({ product, isModal = false }: { product: Product, isModal?: boolean }) {
  const { currency } = useCurrency()
  const activeCurrencyCode = !currency || currency.code === 'USD' ? 'KZT' : currency.code
  let amount = 0,
    lowestAmount = 0,
    highestAmount = 0
  const priceField = `priceIn${activeCurrencyCode}` as keyof Product
  const hasVariants = product.enableVariants && Boolean(product.variants?.docs?.length)

  if (hasVariants) {
    const priceField = `priceIn${activeCurrencyCode}` as keyof Variant
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
    <div className={cn("flex flex-col gap-6", isModal ? "gap-4" : "gap-8")}>
      {/* Title & SKU */}
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground uppercase tracking-wider">
          {sku && <span className="bg-secondary px-1.5 py-0.5 rounded">Арт. {sku}</span>}
          {rating?.value ? (
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={cn("h-2.5 w-2.5", i < Math.floor(rating.value ?? 0) ? "fill-warning text-warning" : "text-gray-200")} />
                ))}
              </div>
              <span className="font-bold text-foreground">{rating.value}</span>
            </div>
          ) : null}
        </div>
        <h1 className={cn(
          "font-bold tracking-tight text-foreground leading-tight",
          isModal ? "text-xl md:text-2xl" : "text-2xl md:text-3xl"
        )}>
          {product.title}
        </h1>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex-1 flex flex-col gap-4">
          {/* Price & Action Block */}
          <div className={cn("rounded-lg border border-gray-100", isModal ? "bg-white p-4" : "bg-gray-50 p-6")}>
            <div className="flex items-center gap-3 mb-3">
              {inStock === 'in_stock' && <span className="text-[10px] font-bold text-success uppercase tracking-wide">● В наличии</span>}
              {inStock === 'preorder' && <span className="text-[10px] font-bold text-warning uppercase tracking-wide">● Под заказ</span>}
              {inStock === 'out_of_stock' && <span className="text-[10px] font-bold text-destructive uppercase tracking-wide">● Нет в наличии</span>}
            </div>

            <div className={cn("font-bold text-primary mb-4", isModal ? "text-3xl" : "text-4xl")}>
              {hasVariants ? (
                <Price highestAmount={highestAmount} lowestAmount={lowestAmount} />
              ) : (
                <Price amount={amount} />
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Suspense fallback={null}>
                  <AddToCart product={product} />
                </Suspense>
              </div>
              {!isModal && <Button variant="outline" className="flex-1">Купить в 1 клик</Button>}
            </div>
          </div>

          {hasVariants && (
            <div className="py-2 border-t border-gray-100">
              <Suspense fallback={null}>
                <VariantSelector product={product} />
              </Suspense>
            </div>
          )}
        </div>
      </div>

      {/* Specs section for Modal - Compact Grid */}
      {isModal && specs && specs.length > 0 && (
        <div className="border-t border-gray-100 pt-4">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground/70">Характеристики</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-[13px]">
            {specs.slice(0, 8).map((spec, i) => (
              <div key={i} className="flex justify-between border-b border-gray-50 pb-1">
                <dt className="text-muted-foreground mr-2">{spec.key}</dt>
                <dd className="font-medium text-foreground text-right">{spec.value}</dd>
              </div>
            ))}
          </dl>
          {specs.length > 8 && (
            <Link 
              href={`/products/${product.slug}`}
              className="mt-4 inline-block text-xs font-bold text-primary hover:underline underline-offset-4 uppercase tracking-widest"
            >
              Все характеристики →
            </Link>
          )}
        </div>
      )}

      {isModal && !specs?.length && (
        <Link 
          href={`/products/${product.slug}`}
          className="text-sm font-bold text-primary hover:underline underline-offset-4"
        >
          Подробнее о товаре →
        </Link>
      )}

      {!isModal && (
        <>
          <hr className="border-gray-100" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {product.description && (
              <div>
                <h3 className="mb-4 text-lg font-bold">Описание</h3>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                  <RichText data={product.description} enableGutter={false} />
                </div>
              </div>
            )}

            {specs && specs.length > 0 && (
              <div>
                <h3 className="mb-4 text-lg font-bold">Характеристики</h3>
                <dl className="flex flex-col divide-y divide-gray-100 text-sm">
                  {specs.map((spec, i) => (
                    <div key={i} className="flex justify-between py-2.5">
                      <dt className="text-muted-foreground pr-4">{spec.key}</dt>
                      <dd className="font-medium text-foreground text-right">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

