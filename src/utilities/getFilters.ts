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

  // Получаем товары, чтобы извлечь уникальные бренды и подсчитать их количество
  const products = await payload.find({
    collection: 'products',
    where,
    limit: 2000, // Анализируем больше товаров для точного подсчета
    select: {
      specs: true,
      priceInKZT: true,
      categories: true,
    }
  })

  const brandCounts = new Map<string, number>()
  const materialCounts = new Map<string, number>()
  const categoryCounts = new Map<string, number>()
  let minPrice = Infinity
  let maxPrice = -Infinity

  products.docs.forEach(product => {
    // Price tracking
    if (product.priceInKZT) {
      if (product.priceInKZT < minPrice) minPrice = product.priceInKZT
      if (product.priceInKZT > maxPrice) maxPrice = product.priceInKZT
    }

    // Category counts
    if (Array.isArray(product.categories)) {
      product.categories.forEach(cat => {
        const id = typeof cat === 'object' ? cat.id : cat
        categoryCounts.set(id.toString(), (categoryCounts.get(id.toString()) || 0) + 1)
      })
    }

    // Specs counts (Brands, Materials)
    product.specs?.forEach(spec => {
      const key = spec.key.toLowerCase().trim()
      const val = spec.value.trim()
      
      if (key === 'бренд' || key === 'производитель' || key === 'brand') {
        brandCounts.set(val, (brandCounts.get(val) || 0) + 1)
      }
      if (key === 'материал' || key === 'material') {
        materialCounts.set(val, (materialCounts.get(val) || 0) + 1)
      }
    })
  })

  // Преобразуем в массивы объектов для удобства фронтенда
  const brands = Array.from(brandCounts.entries())
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => a.title.localeCompare(b.title))

  const materials = Array.from(materialCounts.entries())
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => a.title.localeCompare(b.title))

  return {
    brands,
    materials,
    categoryCounts: Object.fromEntries(categoryCounts),
    minPrice: minPrice === Infinity ? 0 : minPrice,
    maxPrice: maxPrice === -Infinity ? 1000000 : maxPrice
  }
}
