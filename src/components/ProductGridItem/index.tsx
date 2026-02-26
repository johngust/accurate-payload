'use client'

import type { Product } from '@/payload-types'

import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Star } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'
import { ProductModal } from '@/components/ProductModal'

type Props = {
  product: Partial<Product>
}

export const ProductGridItem: React.FC<Props> = ({ product }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { gallery, priceInKZT, title, rating, inStock } = product

  let price = priceInKZT

  const variants = product.variants?.docs

  if (variants && variants.length > 0) {
    const variant = variants[0]
    if (
      variant &&
      typeof variant === 'object' &&
      variant?.priceInKZT &&
      typeof variant.priceInKZT === 'number'
    ) {
      price = variant.priceInKZT
    }
  }

  const image =
    gallery?.[0]?.image && typeof gallery[0]?.image !== 'string' ? gallery[0]?.image : undefined

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsModalOpen(true)
  }

  return (
    <>
      <div 
        onClick={handleOpenModal}
        className="group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-lg border border-gray-100 bg-card p-4 transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
      >
        <div className="relative mb-4 block aspect-square w-full">
          {image && (
            <Media
              className="relative h-full w-full"
              imgClassName="absolute inset-0 h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
              resource={image}
            />
          )}
        </div>

        <div className="flex flex-1 flex-col">
          <div className="mb-2 flex items-center justify-between text-[11px]">
            {inStock === 'in_stock' && <span className="text-success font-semibold uppercase tracking-wider">В наличии</span>}
            {inStock === 'preorder' && <span className="text-warning font-semibold uppercase tracking-wider">Под заказ</span>}
            {inStock === 'out_of_stock' && <span className="text-destructive font-semibold uppercase tracking-wider">Нет в наличии</span>}
            
            {rating?.value ? (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Star className="h-3 w-3 fill-warning text-warning" />
                <span>{rating.value}</span>
              </div>
            ) : null}
          </div>

          <div className="mb-3 h-10">
            <h3 className="line-clamp-2 text-sm font-medium leading-tight text-foreground transition-colors hover:text-primary">
              {title}
            </h3>
          </div>

          <div className="mt-auto flex items-center justify-between gap-2">
            <div className="flex flex-col">
              {typeof price === 'number' && (
                <div className="font-bold text-lg text-primary leading-none">
                  <Price amount={price} />
                </div>
              )}
            </div>

            <Button 
              size="icon" 
              className="h-9 w-9 shrink-0 rounded-md bg-accent hover:bg-accent/90 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                handleOpenModal(e)
              }}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="sr-only">Быстрый просмотр</span>
            </Button>
          </div>
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
