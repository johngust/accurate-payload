// ABOUTME: Сетка промо-баннеров «Все акции в одном месте».
// ABOUTME: Отображает промо типа «sale» из коллекции Promotions.

import type { Promotion } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { Media } from '@/components/Media'

type Props = {
  title?: string | null
  promotions?: (number | Promotion)[] | null
  blockType: 'promoGrid'
  blockName?: string | null
  id?: string | null
}

export const PromoGridBlock: React.FC<Props> = async ({ title, promotions }) => {
  let promos: Promotion[] = []

  if (promotions?.length) {
    promos = promotions
      .map((p) => (typeof p === 'object' ? p : null))
      .filter(Boolean) as Promotion[]
  } else {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'promotions',
      where: { and: [{ active: { equals: true } }, { type: { equals: 'sale' } }] },
      limit: 4,
      depth: 1,
    })
    promos = result.docs
  }

  if (!promos.length) return null

  return (
    <section className="container py-8">
      {title && <h2 className="mb-6 font-heading text-xl font-bold">{title}</h2>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promos.map((promo) => {
          const image = typeof promo.image === 'object' ? promo.image : undefined
          const Wrapper = promo.link?.url ? Link : 'div'
          const wrapperProps = promo.link?.url ? { href: promo.link.url } : {}

          return (
            <Wrapper
              key={promo.id}
              {...(wrapperProps as any)}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl"
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
                {promo.subtitle && <p className="mt-0.5 text-sm opacity-80">{promo.subtitle}</p>}
              </div>
            </Wrapper>
          )
        })}
      </div>
    </section>
  )
}
