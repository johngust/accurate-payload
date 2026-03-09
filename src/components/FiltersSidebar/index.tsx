// ABOUTME: Улучшенная боковая панель фильтров, вдохновленная vsedlyavanny.kz.
// ABOUTME: Включает глобальный поиск по каталогу, счетчики товаров, поиск по брендам и слайдер цены.
// ABOUTME: Компактная версия с внутренним скроллом для длинных списков.

'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/utilities/cn'
import { ChevronRight, Filter, Search, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

type Props = {
  brands?: { title: string; count: number }[]
  materials?: { title: string; count: number }[]
  categories?: { id: string | number; title: string; slug?: string | null }[]
  categoryCounts?: Record<string, number>
  minPossiblePrice?: number
  maxPossiblePrice?: number
}

export const FiltersSidebar: React.FC<Props> = ({
  brands = [],
  materials = [],
  categories = [],
  categoryCounts = {},
  minPossiblePrice = 0,
  maxPossiblePrice = 1000000
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentInStock = searchParams.get('inStock') || ''
  const currentMinPrice = Number(searchParams.get('minPrice')) || minPossiblePrice
  const currentMaxPrice = Number(searchParams.get('maxPrice')) || maxPossiblePrice
  const selectedBrands = useMemo(() => searchParams.get('brand')?.split(',') || [], [searchParams])
  const selectedCategories = useMemo(() => searchParams.get('category')?.split(',') || [], [searchParams])
  const currentGlobalSearch = searchParams.get('q') || ''

  // Local state for UI
  const [priceRange, setPriceRange] = useState<[number, number]>([currentMinPrice, currentMaxPrice])
  const [brandSearch, setBrandSearch] = useState('')
  const [globalSearch, setGlobalSearch] = useState(currentGlobalSearch)
  const [showAllBrands, setShowAllBrands] = useState(false)

  // Sync with URL
  useEffect(() => {
    setPriceRange([currentMinPrice, currentMaxPrice])
  }, [currentMinPrice, currentMaxPrice])

  useEffect(() => {
    setGlobalSearch(currentGlobalSearch)
  }, [currentGlobalSearch])

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
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [router, pathname, searchParams],
  )

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams({ q: globalSearch || null })
  }

  const handleBrandChange = (brand: string) => {
    let newBrands = [...selectedBrands]
    if (newBrands.includes(brand)) {
      newBrands = newBrands.filter(b => b !== brand)
    } else {
      newBrands.push(brand)
    }
    updateParams({ brand: newBrands.length > 0 ? newBrands.join(',') : null })
  }

  const handleCategoryChange = (slug: string) => {
    let newCategories = [...selectedCategories]
    if (newCategories.includes(slug)) {
      newCategories = newCategories.filter(c => c !== slug)
    } else {
      newCategories.push(slug)
    }
    updateParams({ category: newCategories.length > 0 ? newCategories.join(',') : null })
  }

  const handlePriceApply = () => {
    updateParams({
      minPrice: priceRange[0] !== minPossiblePrice ? priceRange[0].toString() : null,
      maxPrice: priceRange[1] !== maxPossiblePrice ? priceRange[1].toString() : null
    })
  }

  const handleReset = () => {
    setPriceRange([minPossiblePrice, maxPossiblePrice])
    setGlobalSearch('')
    router.push(pathname)
  }

  const filteredBrands = brands.filter(b => b.title.toLowerCase().includes(brandSearch.toLowerCase()))
  const visibleBrands = showAllBrands ? filteredBrands : filteredBrands.slice(0, 8)

  const hasActiveFilters = currentInStock ||
    (currentMinPrice !== minPossiblePrice) ||
    (currentMaxPrice !== maxPossiblePrice) ||
    selectedBrands.length > 0 ||
    selectedCategories.length > 0 ||
    currentGlobalSearch

  return (
    <div className="flex flex-col gap-3 sticky top-24 max-h-[calc(100vh-120px)] pb-4 overflow-y-auto custom-scrollbar">
      {/* Global Catalog Search */}
      <form onSubmit={handleGlobalSearch} className="relative group shrink-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
          <Search className="h-3.5 w-3.5" />
        </div>
        <Input
          placeholder="Поиск..."
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          className="pl-9 h-9 bg-white border-border/60 rounded-lg shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-xs"
        />
        {globalSearch && (
          <button
            type="button"
            onClick={() => { setGlobalSearch(''); updateParams({ q: null }); }}
            className="absolute inset-y-0 right-0 pr-2 flex items-center text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </form>

      {/* Main Filter Container */}
      <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden flex flex-col shrink-0">
        {/* Sidebar Header */}
        <div className="px-4 py-2.5 border-b border-border/40 bg-muted/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-primary" />
            <span className="font-bold text-[11px] uppercase tracking-wider">Фильтры</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="text-[9px] font-bold text-muted-foreground hover:text-destructive uppercase tracking-widest transition-colors"
            >
              Сбросить
            </button>
          )}
        </div>

        <Accordion type="multiple" defaultValue={['category', 'price', 'brand']} className="w-full">

          {/* Categories Tree-like */}
          {categories.length > 0 && (
            <AccordionItem value="category" className="px-4 border-b border-border/30">
              <AccordionTrigger className="hover:no-underline py-3 text-[11px] font-bold uppercase tracking-widest text-foreground/80">
                Категории
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <div className="flex flex-col space-y-0.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {categories.map((cat) => {
                    const count = categoryCounts[cat.id.toString()] || 0
                    const isActive = selectedCategories.includes(cat.slug || '')
                    return (
                      <button
                        key={cat.id}
                        onClick={() => cat.slug && handleCategoryChange(cat.slug)}
                        className={cn(
                          "flex items-center justify-between w-full text-left py-1.5 px-2 rounded-md transition-all text-[12px] group relative overflow-hidden",
                          isActive
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2 z-10">
                          <ChevronRight className={cn(
                            "h-3 w-3 transition-transform",
                            isActive ? "rotate-90" : "group-hover:translate-x-0.5"
                          )} />
                          <span className="truncate">{cat.title}</span>
                        </div>
                        <span className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded-full z-10",
                          isActive ? "bg-white/20 text-white" : "bg-muted-foreground/10 text-muted-foreground"
                        )}>
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Price Range with Improved UI */}
          <AccordionItem value="price" className="px-4 border-b border-border/30">
            <AccordionTrigger className="hover:no-underline py-3 text-[11px] font-bold uppercase tracking-widest text-foreground/80">
              Цена
            </AccordionTrigger>
            <AccordionContent className="pb-5 pt-1">
              <div className="flex flex-col gap-4 px-1">
                <Slider
                  min={minPossiblePrice}
                  max={maxPossiblePrice}
                  step={100}
                  value={priceRange}
                  onValueChange={(val) => setPriceRange(val as [number, number])}
                  onValueCommit={handlePriceApply}
                  className="py-2"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase font-black text-muted-foreground tracking-tighter ml-1">От</label>
                    <Input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="h-7 px-2 text-[10px] bg-muted/20 border-border/40 rounded-md"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase font-black text-muted-foreground tracking-tighter ml-1">До</label>
                    <Input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="h-7 px-2 text-[10px] bg-muted/20 border-border/40 rounded-md"
                    />
                  </div>
                </div>

                <Button
                  size="sm"
                  className="w-full h-7 text-[10px] uppercase tracking-widest font-black rounded-md"
                  onClick={handlePriceApply}
                >
                  ОК
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Brands with Counts and Search */}
          <AccordionItem value="brand" className="px-4 border-none">
            <AccordionTrigger className="hover:no-underline py-3 text-[11px] font-bold uppercase tracking-widest text-foreground/80">
              Бренды
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-3 pt-0.5">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/60" />
                  <Input
                    placeholder="Бренд..."
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    className="h-7 pl-7 text-[11px] bg-muted/20 border-none rounded-md focus-visible:ring-1 focus-visible:ring-primary/30"
                  />
                </div>

                <div className="flex flex-col gap-0.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  {visibleBrands.length > 0 ? visibleBrands.map((brand) => (
                    <div
                      key={brand.title}
                      onClick={() => handleBrandChange(brand.title)}
                      className={cn(
                        "flex cursor-pointer items-center justify-between py-1 px-1.5 rounded-md transition-colors group",
                        selectedBrands.includes(brand.title) ? "bg-primary/5" : "hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedBrands.includes(brand.title)}
                          className="h-3.5 w-3.5 rounded-[3px] border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
                        />
                        <span className={cn(
                          "text-[12px] transition-colors",
                          selectedBrands.includes(brand.title) ? "text-primary font-medium" : "text-muted-foreground group-hover:text-foreground"
                        )}>
                          {brand.title}
                        </span>
                      </div>
                      <span className="text-[9px] font-medium text-muted-foreground/50">
                        {brand.count}
                      </span>
                    </div>
                  )) : (
                    <div className="text-center py-4 opacity-40">
                      <p className="text-[10px] uppercase tracking-tighter">Нет результатов</p>
                    </div>
                  )}
                </div>

                {filteredBrands.length > 8 && (
                  <button
                    onClick={() => setShowAllBrands(!showAllBrands)}
                    className="w-full py-1.5 text-[10px] font-bold text-primary uppercase tracking-widest hover:bg-primary/5 rounded-md transition-colors border border-dashed border-primary/20 mt-1"
                  >
                    {showAllBrands ? 'Свернуть' : `Еще (${filteredBrands.length - 8})`}
                  </button>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Info Block - Smaller */}
      <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 shrink-0">
        <h4 className="font-bold text-[10px] mb-1 uppercase tracking-wider text-primary">Нужна помощь?</h4>
        <p className="text-[10px] text-muted-foreground leading-tight mb-2">
          Наши эксперты помогут подобрать идеальную сантехнику.
        </p>
        <Button variant="outline" size="sm" className="w-full h-7 text-[9px] font-bold uppercase tracking-widest border-primary/20 hover:bg-primary hover:text-white transition-all">
          Консультация
        </Button>
      </div>
    </div>
  )
}
