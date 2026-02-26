'use client'

import React, { useEffect, useState, Suspense } from 'react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { getProductBySlugAction } from '@/app/(app)/actions'
import type { Product } from '@/payload-types'
import { ProductDescription } from '@/components/product/ProductDescription'
import { Gallery } from '@/components/product/Gallery'
import { LoadingSpinner } from '@/components/LoadingSpinner'

type Props = {
  slug: string
  isOpen: boolean
  onClose: (open: boolean) => void
}

export const ProductModal: React.FC<Props> = ({ slug, isOpen, onClose }) => {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && slug) {
      setLoading(true)
      getProductBySlugAction(slug)
        .then((data) => {
          setProduct(data as Product)
        })
        .catch((err) => {
          console.error('Failed to fetch product:', err)
          setProduct(null)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [isOpen, slug])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] lg:max-w-7xl p-0 overflow-hidden border-none bg-transparent shadow-none">
        <div className="bg-white rounded-xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row shadow-2xl relative">
          {loading ? (
            <div className="w-full h-[500px] flex items-center justify-center bg-white">
              <div className="flex flex-col items-center gap-4">
                <LoadingSpinner />
                <p className="text-sm text-muted-foreground animate-pulse">Загрузка данных...</p>
              </div>
            </div>
          ) : product ? (
            <>
              <div className="w-full md:w-1/2 bg-gray-50 flex flex-col items-center justify-center p-8 border-r border-gray-100">
                <div className="w-full max-w-[550px]">
                  <Suspense fallback={<div className="aspect-square bg-gray-200 animate-pulse rounded-lg" />}>
                    {(() => {
                      const validGallery = product.gallery?.filter(item => item && typeof item.image === 'object')
                      if (validGallery && validGallery.length > 0) {
                        return (
                          <Gallery 
                            gallery={validGallery.map(item => ({
                              ...item,
                              image: item.image as any
                            }))} 
                          />
                        )
                      }
                      return (
                        <div className="aspect-square bg-white rounded-lg border border-gray-100 flex items-center justify-center">
                          <p className="text-muted-foreground text-sm">Нет изображений</p>
                        </div>
                      )
                    })()}
                  </Suspense>
                </div>
              </div>
              <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto bg-white">
                <ProductDescription product={product} isModal={true} />
              </div>
            </>
          ) : (
            <div className="w-full h-[300px] flex items-center justify-center bg-white p-12 text-center">
              <div>
                <p className="text-xl font-bold mb-2">Упс!</p>
                <p className="text-muted-foreground">Не удалось загрузить информацию о товаре.</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
