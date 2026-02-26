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
      <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold uppercase tracking-wider text-foreground/80">Фильтры</h3>

        <Accordion type="multiple" defaultValue={['inStock', 'price']} className="w-full">
          <AccordionItem value="inStock" className="border-b-gray-100">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3 uppercase tracking-wide">
              Наличие
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-3 py-2">
                {stockOptions.map((option) => (
                  <label key={option.value} className="flex cursor-pointer items-center gap-2.5">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        className="peer h-4 w-4 appearance-none rounded border border-gray-300 bg-white checked:bg-primary checked:border-primary focus:ring-0 transition-all cursor-pointer"
                        checked={currentInStock === option.value}
                        onChange={() => handleStockChange(option.value)}
                      />
                      <svg className="absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none left-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-foreground/80">{option.label}</span>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="price" className="border-none">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3 uppercase tracking-wide">Цена</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground uppercase font-bold">от</span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full rounded border border-gray-200 bg-white pl-8 pr-3 py-2 text-sm focus:border-primary outline-none transition-colors"
                    />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground uppercase font-bold">до</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full rounded border border-gray-200 bg-white pl-8 pr-3 py-2 text-sm focus:border-primary outline-none transition-colors"
                    />
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full h-9 font-semibold text-xs uppercase tracking-wider" onClick={handlePriceApply}>
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
            className="mt-6 w-full text-[11px] uppercase tracking-widest font-bold text-muted-foreground hover:text-destructive transition-colors"
            onClick={handleReset}
          >
            Сбросить всё
          </Button>
        )}
      </div>
    </div>
  )
}
