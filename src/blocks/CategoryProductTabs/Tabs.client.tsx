'use client'
// ABOUTME: Клиентский компонент табов подборки товаров по категориям.
// ABOUTME: Переключение табов загружает товары через API-запрос к Payload REST.

import type { Product } from '@/payload-types'
import { ProductGridItem } from '@/components/ProductGridItem'
import { useState, useCallback } from 'react'
import { cn } from '@/utilities/cn'

type Tab = { id: number; title: string; slug: string }

type Props = {
  tabs: Tab[]
  initialProducts: Product[]
  limit: number
}

export const TabsClient: React.FC<Props> = ({ tabs, initialProducts, limit }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(false)
  const [cache, setCache] = useState<Record<number, Product[]>>({
    [tabs[0]?.id]: initialProducts,
  })

  const handleTabClick = useCallback(async (tabId: number) => {
    if (tabId === activeTab) return
    setActiveTab(tabId)

    if (cache[tabId]) {
      setProducts(cache[tabId])
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        'where[categories][contains]': String(tabId),
        'where[_status][equals]': 'published',
        limit: String(limit),
        depth: '1',
      })
      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      const docs = data.docs || []
      setProducts(docs)
      setCache((prev) => ({ ...prev, [tabId]: docs }))
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [activeTab, cache, limit])

  return (
    <div>
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              'shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-foreground hover:bg-secondary/80',
            )}
          >
            {tab.title}
          </button>
        ))}
      </div>

      <div className={cn('grid grid-cols-2 gap-4 md:grid-cols-4', loading && 'opacity-50')}>
        {products.map((product) => (
          <ProductGridItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
