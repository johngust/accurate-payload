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
    limit: 1000, // Анализируем первые 1000 товаров для поиска фильтров
    select: {
      specs: true
    }
  })

  const brands = new Set<string>()
  const materials = new Set<string>()

  products.docs.forEach(product => {
    product.specs?.forEach(spec => {
      const key = spec.key.toLowerCase().trim()
      const val = spec.value.trim()
      
      if (key === 'бренд' || key === 'производитель' || key === 'brand') {
        brands.add(val)
      }
      if (key === 'материал' || key === 'material') {
        materials.add(val)
      }
    })
  })

  return {
    brands: Array.from(brands).sort((a, b) => a.localeCompare(b)),
    materials: Array.from(materials).sort((a, b) => a.localeCompare(b))
  }
}
