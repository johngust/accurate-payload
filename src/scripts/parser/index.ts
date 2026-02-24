// ABOUTME: Оркестратор загрузки каталога сантехники в Payload CMS.
// ABOUTME: Создаёт категории и товары из предопределённых данных.

import configPromise from '@payload-config'
import 'dotenv/config'
import { getPayload, type Payload } from 'payload'

import { categories } from './categories'
import { products } from './products'

async function findOrCreateCategory(
  payload: Payload,
  slug: string,
  data: { title: string; slug: string; parent?: number },
) {
  const existing = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  if (existing.docs.length > 0) {
    console.log(`  [существует] ${slug}`)
    return existing.docs[0]
  }
  const created = await payload.create({
    collection: 'categories',
    data,
  })
  console.log(`  [создана] ${slug}`)
  return created
}

async function seedCategories(payload: Payload) {
  console.log('\n=== Создание категорий ===')
  const categoryMap = new Map<string, number>()

  for (const cat of categories) {
    const created = await findOrCreateCategory(payload, cat.slug, {
      title: cat.title,
      slug: cat.slug,
    })
    categoryMap.set(cat.slug, created.id)

    if (cat.children) {
      for (const child of cat.children) {
        const childCreated = await findOrCreateCategory(payload, child.slug, {
          title: child.title,
          slug: child.slug,
          parent: created.id,
        })
        categoryMap.set(child.slug, childCreated.id)
      }
    }
  }

  return categoryMap
}

async function seedProducts(payload: Payload, categoryMap: Map<string, number>) {
  console.log('\n=== Создание товаров ===')

  for (const prod of products) {
    const categoryId = categoryMap.get(prod.categorySlug)
    if (!categoryId) {
      console.warn(`  [пропуск] Категория не найдена: ${prod.categorySlug}`)
      continue
    }

    const existing = await payload.find({
      collection: 'products',
      where: { sku: { equals: prod.sku } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`  [существует] ${prod.sku} — ${prod.title}`)
      continue
    }

    await payload.create({
      collection: 'products',
      data: {
        title: prod.title,
        slug: prod.slug,
        _status: 'published',
        priceInUSD: prod.price,
        inStock: prod.inStock,
        sku: prod.sku,
        rating: prod.rating,
        specs: prod.specs,
        categories: [categoryId],
        meta: {
          title: prod.title,
          description: `Купить ${prod.title} по выгодной цене с доставкой.`,
        },
      },
    })
    console.log(`  [создан] ${prod.sku} — ${prod.title}`)
  }
}

async function main() {
  console.log('Запуск загрузки каталога...')
  const payload = await getPayload({ config: configPromise })

  const categoryMap = await seedCategories(payload)
  console.log(`\nКатегорий в индексе: ${categoryMap.size}`)

  await seedProducts(payload, categoryMap)

  console.log('\n=== Загрузка завершена ===')
  process.exit(0)
}

main().catch((err) => {
  console.error('Ошибка:', err)
  process.exit(1)
})
