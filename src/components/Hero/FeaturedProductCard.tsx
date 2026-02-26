'use client'
// ABOUTME: Компактная карточка «Товар дня» со скидкой для Hero-секции.
// ABOUTME: Показывает товар, процент скидки и зачёркнутую старую цену.

import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import type { FeaturedProduct } from '@/payload-types'
import React, { useState } from 'react'
import { ProductModal } from '@/components/ProductModal'

type Props = {
  featured: FeaturedProduct
}

export const FeaturedProductCard: React.FC<Props> = ({ featured }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const product = typeof featured.product === 'object' ? featured.product : null
  if (!product) return null

  const image =
    product.gallery?.[0]?.image && typeof product.gallery[0].image === 'object'
      ? product.gallery[0].image
      : undefined

  const price = product.priceInKZT
  const oldPrice =
    featured.discountPercent && price
      ? Math.round(price / (1 - featured.discountPercent / 100))
      : undefined

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsModalOpen(true)
  }

  return (
    <>
      <div 
        onClick={handleOpenModal}
        className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-gray-100 bg-card p-5 transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
      >
        <div className="relative mb-2 flex items-center justify-between">
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider">{featured.title}</span>
          {featured.discountPercent && (
            <span className="relative z-20 rounded bg-accent px-2 py-0.5 text-[11px] font-bold text-white">
              -{featured.discountPercent}%
            </span>
          )}
        </div>

        <div className="relative mb-3 flex w-full flex-1 flex-col">
          <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg bg-gray-50/50">
            {image && (
              <Media
                resource={image}
                imgClassName="absolute inset-0 h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            )}
          </div>
          <h3 className="mb-2 line-clamp-2 text-sm font-medium transition-colors duration-200 group-hover:text-primary leading-snug">
            {product.title}
          </h3>
        </div>

        <div className="mt-auto flex items-baseline gap-2">
          {typeof price === 'number' && (
            <div className="font-bold text-2xl text-primary">
              <Price amount={price} />
            </div>
          )}
          {oldPrice && (
            <div className="text-sm text-muted-foreground line-through decoration-muted-foreground/50">
              <Price amount={oldPrice} />
            </div>
          )}
        </div>
      </div>

      {product.slug && (
        <ProductModal 
          slug={product.slug} 
          isOpen={isModalOpen} 
          onClose={setIsModalOpen} 
        />
      )}
    </>
  )
}
