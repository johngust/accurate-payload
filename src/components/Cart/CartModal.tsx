'use client'

import { Price } from '@/components/Price'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Product } from '@/payload-types'
import { DeleteItemButton } from './DeleteItemButton'
import { EditItemQuantityButton } from './EditItemQuantityButton'
import { OpenCartButton } from './OpenCart'

export function CartModal() {
  const { cart } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  const pathname = usePathname()

  useEffect(() => {
    // Close the cart modal when the pathname changes.
    setIsOpen(false)
  }, [pathname])

  const totalQuantity = useMemo(() => {
    if (!cart || !cart.items || !cart.items.length) return undefined
    return cart.items.reduce((quantity, item) => (item.quantity || 0) + quantity, 0)
  }, [cart])

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger asChild>
        <OpenCartButton quantity={totalQuantity} />
      </SheetTrigger>

      <SheetContent className="flex flex-col p-0">
        <div className="p-6 border-b">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold uppercase tracking-tight">Ваша корзина</SheetTitle>
            <SheetDescription className="hidden">Управляйте вашей корзиной</SheetDescription>
          </SheetHeader>
        </div>

        {!cart || cart?.items?.length === 0 ? (
          <div className="grow flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground">Ваша корзина пуста</p>
            <Button asChild variant="outline" className="mt-2">
              <Link href="/catalog" onClick={() => setIsOpen(false)}>Перейти в каталог</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            <ul className="grow overflow-auto p-6 space-y-6">
              {cart?.items?.map((item, i) => {
                const product = item.product
                const variant = item.variant

                if (typeof product !== 'object' || !item || !product || !product.slug)
                  return <React.Fragment key={i} />

                const metaImage =
                  product.meta?.image && typeof product.meta?.image === 'object'
                    ? product.meta.image
                    : undefined

                const firstGalleryImage =
                  typeof product.gallery?.[0]?.image === 'object'
                    ? product.gallery?.[0]?.image
                    : undefined

                let image = firstGalleryImage || metaImage
                let price = product.priceInKZT

                const isVariant = Boolean(variant) && typeof variant === 'object'

                if (isVariant) {
                  price = variant?.priceInKZT

                  const imageVariant = product.gallery?.find((item: any) => {
                    if (!item.variantOption) return false
                    const variantOptionID =
                      typeof item.variantOption === 'object'
                        ? item.variantOption.id
                        : item.variantOption

                    const hasMatch = variant?.options?.some((option: any) => {
                      if (typeof option === 'object') return option.id === variantOptionID
                      else return option === variantOptionID
                    })

                    return hasMatch
                  })

                  if (imageVariant && typeof imageVariant.image === 'object') {
                    image = imageVariant.image
                  }
                }

                return (
                  <li className="flex gap-4 relative group" key={i}>
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-50">
                      {image?.url && (
                        <Image
                          alt={image?.alt || product?.title || ''}
                          className="h-full w-full object-contain p-1"
                          height={80}
                          src={image.url}
                          width={80}
                        />
                      )}
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex justify-between gap-2">
                          <Link
                            href={`/products/${(item.product as Product)?.slug}`}
                            className="text-sm font-medium leading-snug hover:text-primary transition-colors line-clamp-2"
                            onClick={() => setIsOpen(false)}
                          >
                            {product?.title}
                          </Link>
                          <DeleteItemButton item={item} />
                        </div>
                        {isVariant && variant ? (
                          <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider">
                            {variant.options
                              ?.map((option: any) => {
                                if (typeof option === 'object') return option.label
                                return null
                              })
                              .join(', ')}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex h-8 items-center rounded border border-gray-200 bg-white overflow-hidden">
                          <EditItemQuantityButton item={item} type="minus" />
                          <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                          <EditItemQuantityButton item={item} type="plus" />
                        </div>
                        {typeof price === 'number' && (
                          <Price
                            amount={price}
                            className="text-sm font-bold text-primary"
                          />
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="p-6 bg-gray-50 border-t mt-auto">
              {typeof cart?.subtotal === 'number' && (
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Итого:</span>
                  <Price
                    amount={cart?.subtotal}
                    className="text-2xl font-bold text-primary"
                  />
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button asChild className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20">
                  <Link href="/checkout" onClick={() => setIsOpen(false)}>
                    Оформить заказ
                  </Link>
                </Button>
                <Button variant="outline" className="w-full h-12" onClick={() => setIsOpen(false)}>
                  Продолжить покупки
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
