// ABOUTME: Утилита для динамического получения доступных фильтров (брендов, параметров) для категорий.

import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function getCategoryFilters(categoryId?: string) {
  const payload = await getPayload({ config: configPromise })

  const where: any = {
    _status: { equals: 'published' }
  }

  if (categoryId) {
    where.categories = { contains: categoryId }
  }

  // Получаем товары, чтобы извлечь уникальные бренды
  const products = await payload.find({
    collection: 'products',
    where,
    limit: 500, // Анализируем первые 500 товаров
    select: {
      specs: true
    }
  })

  const brands = new Set<string>()
  const materials = new Set<string>()

  products.docs.forEach(product => {
    product.specs?.forEach(spec => {
      if (spec.key.toLowerCase() === 'бренд' || spec.key.toLowerCase() === 'производитель') {
        brands.add(spec.value)
      }
      if (spec.key.toLowerCase() === 'материал') {
        materials.add(spec.value)
      }
    })
  })

  return {
    brands: Array.from(brands).sort(),
    materials: Array.from(materials).sort()
  }
}
