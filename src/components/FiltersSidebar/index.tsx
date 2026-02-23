// ABOUTME: Боковая панель фильтров для каталога товаров.
// ABOUTME: Фильтр наличия (checkbox) и цены (min/max) через URL searchParams.

'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useState } from 'react'

const stockOptions = [
  { label: 'В наличии', value: 'in_stock' },
  { label: 'Под заказ', value: 'preorder' },
]

export const FiltersSidebar: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentInStock = searchParams.get('inStock') || ''
  const currentMinPrice = searchParams.get('minPrice') || ''
  const currentMaxPrice = searchParams.get('maxPrice') || ''

  const [minPrice, setMinPrice] = useState(currentMinPrice)
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice)

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    },
    [router, pathname, searchParams],
  )

  const handleStockChange = (value: string) => {
    updateParams({ inStock: currentInStock === value ? null : value })
  }

  const handlePriceApply = () => {
    updateParams({ minPrice: minPrice || null, maxPrice: maxPrice || null })
  }

  const handleReset = () => {
    setMinPrice('')
    setMaxPrice('')
    router.push(pathname)
  }

  const hasActiveFilters = currentInStock || currentMinPrice || currentMaxPrice

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 font-heading text-lg font-semibold">Фильтры</h3>

        <Accordion type="multiple" defaultValue={['inStock', 'price']} className="w-full">
          <AccordionItem value="inStock">
            <AccordionTrigger className="font-medium hover:no-underline">
              Наличие
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-3 py-2">
                {stockOptions.map((option) => (
                  <label key={option.value} className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={currentInStock === option.value}
                      onChange={() => handleStockChange(option.value)}
                    />
                    <span className="text-sm font-medium leading-none">{option.label}</span>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="price">
            <AccordionTrigger className="font-medium hover:no-underline">Цена</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-3 py-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="от"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                  <span className="text-muted-foreground">—</span>
                  <input
                    type="number"
                    placeholder="до"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <Button size="sm" variant="outline" className="w-full" onClick={handlePriceApply}>
                  Применить
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 w-full text-muted-foreground"
            onClick={handleReset}
          >
            Сбросить фильтры
          </Button>
        )}
      </div>
    </div>
  )
}
