// ABOUTME: Типы для данных парсера/сида каталога.
// ABOUTME: Описывают структуру категорий и товаров для загрузки в Payload.

export type ParsedCategory = {
  title: string
  slug: string
  imageUrl?: string
  children?: ParsedCategory[]
}

export type ParsedProduct = {
  title: string
  slug: string
  price: number
  sku: string
  inStock: 'in_stock' | 'preorder' | 'out_of_stock'
  rating: { value: number; count: number }
  specs: { key: string; value: string }[]
  categorySlug: string
  imageUrls: string[]
}
