'use client'
// ABOUTME: Клиентский компонент слайдера промо-баннеров в Hero-секции.
// ABOUTME: Использует embla-carousel с автопрокруткой и точками-индикаторами.

import type { Promotion } from '@/payload-types'
import { Media } from '@/components/Media'
import Link from 'next/link'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel'
import AutoPlay from 'embla-carousel-autoplay'
import { useState, useEffect, useCallback } from 'react'

type Props = {
  promotions: Promotion[]
}

export const PromoSlider: React.FC<Props> = ({ promotions }) => {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  const onSelect = useCallback(() => {
    if (!api) return
    setCurrent(api.selectedScrollSnap())
  }, [api])

  useEffect(() => {
    if (!api) return
    onSelect()
    api.on('select', onSelect)
    return () => {
      api.off('select', onSelect)
    }
  }, [api, onSelect])

  if (!promotions.length) return null

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <Carousel
        setApi={setApi}
        opts={{ align: 'start', loop: true }}
        plugins={[AutoPlay({ delay: 5000, stopOnInteraction: true })]}
        className="w-full"
      >
        <CarouselContent>
          {promotions.map((promo) => {
            const image = typeof promo.image === 'object' ? promo.image : undefined
            const Wrapper = promo.link?.url ? Link : 'div'
            const wrapperProps = promo.link?.url ? { href: promo.link.url } : {}

            return (
              <CarouselItem key={promo.id} className="relative aspect-[16/9] w-full">
                <Wrapper {...(wrapperProps as any)} className="relative block h-full w-full">
                  {image && (
                    <Media
                      resource={image}
                      imgClassName="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h2 className="text-2xl font-bold">{promo.title}</h2>
                    {promo.subtitle && (
                      <p className="mt-1 text-sm opacity-90">{promo.subtitle}</p>
                    )}
                    {promo.link?.label && (
                      <span className="mt-3 inline-block rounded-lg bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                        {promo.link.label}
                      </span>
                    )}
                  </div>
                </Wrapper>
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>
      {promotions.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {promotions.map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === current ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
