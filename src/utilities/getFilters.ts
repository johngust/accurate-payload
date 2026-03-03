// ABOUTME: Утилита для динамического получения доступных фильтров (брендов, параметров) для категорий.

import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function getCategoryFilters(categoryId?: string | number) {
  const payload = await getPayload({ config: configPromise })

  const where: any = {
    _status: { equals: 'published' }
  }

  if (categoryId) {
    // Находим все подкатегории, чтобы включить их товары в фильтры родителя
    const subCategories = await payload.find({
      collection: 'categories',
      where: {
        or: [
          { id: { equals: categoryId } },
          { parent: { equals: categoryId } }
        ]
      },
      limit: 100,
      depth: 0
    })
    
    const allCategoryIds = subCategories.docs.map(c => c.id)
    where.categories = { in: allCategoryIds }
  }

  // Получаем все категории для построения иерархии
  const allCategoriesRes = await payload.find({
    collection: 'categories',
    limit: 500,
    depth: 0,
  })
  const allCategories = allCategoriesRes.docs

  // Получаем товары, чтобы извлечь уникальные бренды и подсчитать их количество
  const products = await payload.find({
    collection: 'products',
    where,
    limit: 2000, // Анализируем больше товаров для точного подсчета
    depth: 0,
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

    // Category counts (Cumulative)
    if (Array.isArray(product.categories)) {
      const processedInThisProduct = new Set<string | number>()
      
      product.categories.forEach(catId => {
        const id = typeof catId === 'object' ? (catId as any).id : catId
        if (!id) return

        // Добавляем саму категорию
        if (!processedInThisProduct.has(id)) {
          categoryCounts.set(id.toString(), (categoryCounts.get(id.toString()) || 0) + 1)
          processedInThisProduct.add(id)
        }

        // Добавляем родительскую категорию (для корректных счетчиков в фильтрах)
        const catObj = allCategories.find(c => c.id === id)
        if (catObj && catObj.parent) {
          const parentId = typeof catObj.parent === 'object' ? (catObj.parent as any).id : catObj.parent
          if (parentId && !processedInThisProduct.has(parentId)) {
            categoryCounts.set(parentId.toString(), (categoryCounts.get(parentId.toString()) || 0) + 1)
            processedInThisProduct.add(parentId)
          }
        }
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
