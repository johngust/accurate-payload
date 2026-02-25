// ABOUTME: Горизонтальная сетка логотипов брендов.
// ABOUTME: Тянет все бренды из коллекции Brands, отсортированные по sortOrder.

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { Media } from '@/components/Media'

type Props = {
  title?: string | null
}

export const BrandsBlockComponent: React.FC<Props> = async ({ title }) => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'brands',
    sort: 'sortOrder',
    limit: 20,
    depth: 1,
  })

  if (!result.docs.length) return null

  return (
    <section className="container py-8">
      <div className="flex items-center justify-between mb-6">
        {title && <h2 className="font-heading text-xl font-bold">{title}</h2>}
        <Link href="/brands" className="text-sm font-medium text-primary hover:underline">
          Все бренды
        </Link>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-8">
        {result.docs.map((brand) => {
          const logo = brand.logo && typeof brand.logo === 'object' ? brand.logo : undefined
          const content = logo ? (
            <Media
              resource={logo}
              imgClassName="h-10 w-auto object-contain grayscale transition-all hover:grayscale-0"
            />
          ) : (
            <span className="text-lg font-bold text-muted-foreground">{brand.name}</span>
          )

          return brand.link?.url ? (
            <Link key={brand.id} href={brand.link.url} className="shrink-0">
              {content}
            </Link>
          ) : (
            <div key={brand.id} className="shrink-0">
              {content}
            </div>
          )
        })}
      </div>
    </section>
  )
}
