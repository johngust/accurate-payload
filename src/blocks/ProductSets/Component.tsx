// ABOUTME: Горизонтальная карусель «Готовые решения» — комплекты сантехники.
// ABOUTME: Каждый комплект — карточка с фото, названием и ценой.

import Link from 'next/link'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'

type SetItem = {
  title: string
  image: any
  price?: number | null
  link?: { url?: string | null } | null
  id?: string | null
}

type Props = {
  title?: string | null
  sets?: SetItem[] | null
  blockType: 'productSets'
  blockName?: string | null
  id?: string | null
}

export const ProductSetsBlock: React.FC<Props> = ({ title, sets }) => {
  if (!sets?.length) return null

  return (
    <section className="container py-8">
      {title && <h2 className="mb-6 font-heading text-xl font-bold">{title}</h2>}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {sets.map((set, i) => {
          const image = set.image && typeof set.image === 'object' ? set.image : undefined
          const Wrapper = set.link?.url ? Link : 'div'
          const wrapperProps = set.link?.url ? { href: set.link.url } : {}

          return (
            <Wrapper
              key={set.id || i}
              {...(wrapperProps as any)}
              className="group w-[280px] shrink-0 overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative aspect-[4/3]">
                {image && (
                  <Media
                    resource={image}
                    imgClassName="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="line-clamp-2 text-sm font-medium">{set.title}</h3>
                {typeof set.price === 'number' && (
                  <p className="mt-1 font-heading text-lg font-bold">
                    <Price amount={set.price} as="span" />
                  </p>
                )}
              </div>
            </Wrapper>
          )
        })}
      </div>
    </section>
  )
}
