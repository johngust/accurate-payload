// ABOUTME: Серверный компонент Header — загружает навигацию и дерево категорий.
// ABOUTME: Передаёт данные в HeaderClient для рендеринга.

import type { Category } from '@/payload-types'

import { getCachedGlobal } from '@/utilities/getGlobals'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import './index.css'
import { HeaderClient } from './index.client'

export type CategoryTree = Pick<Category, 'id' | 'title' | 'slug' | 'image'> & {
  children: Pick<Category, 'id' | 'title' | 'slug'>[]
}

export async function Header() {
  const header = await getCachedGlobal('header', 1)()

  const payload = await getPayload({ config: configPromise })

  // Корневые категории
  const rootCategories = await payload.find({
    collection: 'categories',
    where: { parent: { exists: false } },
    sort: 'title',
    limit: 50,
    depth: 1,
  })

  // Для каждой корневой — подкатегории
  const categoryTree: CategoryTree[] = await Promise.all(
    rootCategories.docs.map(async (cat) => {
      const subs = await payload.find({
        collection: 'categories',
        where: { parent: { equals: cat.id } },
        sort: 'title',
        limit: 50,
        depth: 0,
      })
      return {
        id: cat.id,
        title: cat.title,
        slug: cat.slug,
        image: cat.image,
        children: subs.docs.map((s) => ({ id: s.id, title: s.title, slug: s.slug })),
      }
    }),
  )

  return <HeaderClient header={header} categories={categoryTree} />
}
