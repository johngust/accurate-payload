// ABOUTME: Ряд из 3 промо-карточек с изображением и заголовком.
// ABOUTME: Тянет данные из коллекции Promotions по типу «banner».

import type { Promotion } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { Media } from '@/components/Media'

type Props = {
  source?: ('all_active' | 'manual') | null
  promotions?: (number | Promotion)[] | null
}

export const PromoBannersBlock: React.FC<Props> = async ({ source, promotions }) => {
  let promos: Promotion[] = []

  if (source === 'manual' && promotions?.length) {
    promos = promotions
      .map((p: number | Promotion) => (typeof p === 'object' ? p : null))
      .filter(Boolean) as Promotion[]
  } else {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'promotions',
      where: { and: [{ active: { equals: true } }, { type: { equals: 'banner' } }] },
      limit: 4,
      depth: 1,
    })
    promos = result.docs
  }

  if (!promos.length) return null

  return (
    <section className="container py-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promos.map((promo) => {
          const image = typeof promo.image === 'object' ? promo.image : undefined
          const Wrapper = promo.link?.url ? Link : 'div'
          const wrapperProps = promo.link?.url ? { href: promo.link.url } : {}

          return (
            <Wrapper
              key={promo.id}
              {...(wrapperProps as any)}
              className="group relative aspect-[16/9] overflow-hidden rounded-2xl"
            >
              {image && (
                <Media
                  resource={image}
                  imgClassName="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-lg font-bold">{promo.title}</h3>
                {promo.subtitle && (
                  <p className="mt-0.5 text-sm opacity-80">{promo.subtitle}</p>
                )}
              </div>
            </Wrapper>
          )
        })}
      </div>
    </section>
  )
}
