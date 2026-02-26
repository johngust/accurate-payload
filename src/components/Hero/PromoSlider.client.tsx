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
    <div className="relative overflow-hidden rounded-lg shadow-sm">
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
              <CarouselItem key={promo.id} className="relative aspect-[21/9] w-full">
                <Wrapper {...(wrapperProps as any)} className="relative block h-full w-full">
                  {image && (
                    <Media
                      resource={image}
                      imgClassName="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12 text-white max-w-xl">
                    <h2 className="text-3xl md:text-4xl font-bold leading-tight drop-shadow-md">{promo.title}</h2>
                    {promo.subtitle && (
                      <p className="mt-2 text-base md:text-lg opacity-90 drop-shadow-sm">{promo.subtitle}</p>
                    )}
                    {promo.link?.label && (
                      <div className="mt-6">
                        <span className="inline-block rounded bg-primary px-6 py-2.5 text-sm font-bold shadow-lg transition-transform hover:scale-105">
                          {promo.link.label}
                        </span>
                      </div>
                    )}
                  </div>
                </Wrapper>
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>
      {promotions.length > 1 && (
        <div className="absolute bottom-4 left-8 flex gap-2">
          {promotions.map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              className={`h-1.5 transition-all duration-300 rounded-full ${
                i === current ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
