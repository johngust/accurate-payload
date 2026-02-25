// ABOUTME: Горизонтальный прокручиваемый ряд иконок корневых категорий.
// ABOUTME: Категория — маленькая иконка 48px + название. Быстрая навигация по каталогу.

import type { Category } from '@/payload-types'
import type { Where } from 'payload'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { Media } from '@/components/Media'

type Props = {
  categories?: (number | Category)[] | null
}

export const CategoryIconsRowBlock: React.FC<Props> = async ({ categories }) => {
  const payload = await getPayload({ config: configPromise })

  const where: Where = categories?.length
    ? { id: { in: categories.map((c: number | Category) => (typeof c === 'object' ? c.id : c)) } }
    : { parent: { exists: false } }

  const result = await payload.find({
    collection: 'categories',
    where,
    limit: 12,
    depth: 1,
  })
  const cats = result.docs

  if (!cats.length) return null

  return (
    <section className="container py-4">
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {cats.map((cat) => {
          const image =
            cat.image && typeof cat.image === 'object' ? cat.image : undefined
          return (
            <Link
              key={cat.id}
              href={`/catalog/${cat.slug}`}
              className="flex shrink-0 flex-col items-center gap-2 rounded-xl px-3 py-2 transition-colors hover:bg-secondary"
            >
              {image ? (
                <div className="h-12 w-12">
                  <Media
                    resource={image}
                    imgClassName="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-lg font-bold text-muted-foreground">
                  {cat.title.charAt(0)}
                </div>
              )}
              <span className="max-w-[80px] text-center text-xs font-medium leading-tight">
                {cat.title}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
