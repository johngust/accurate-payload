// ABOUTME: Улучшенная боковая панель фильтров, вдохновленная vsedlyavanny.kz.
// ABOUTME: Включает глобальный поиск по каталогу, счетчики товаров, поиск по брендам и слайдер цены.

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
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useState, useEffect, useMemo } from 'react'
import { Search, X, ChevronRight, Filter, ShoppingBag } from 'lucide-react'
import { cn } from '@/utilities/cn'

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
  const visibleBrands = showAllBrands ? filteredBrands : filteredBrands.slice(0, 10)

  const hasActiveFilters = currentInStock || 
    (currentMinPrice !== minPossiblePrice) || 
    (currentMaxPrice !== maxPossiblePrice) || 
    selectedBrands.length > 0 || 
    selectedCategories.length > 0 ||
    currentGlobalSearch

  return (
    <div className="flex flex-col gap-5 sticky top-24 pb-10">
      {/* Global Catalog Search */}
      <form onSubmit={handleGlobalSearch} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
          <Search className="h-4 w-4" />
        </div>
        <Input
          placeholder="Поиск по каталогу..."
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          className="pl-10 h-11 bg-white border-border/60 rounded-xl shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-sm"
        />
        {globalSearch && (
          <button 
            type="button" 
            onClick={() => { setGlobalSearch(''); updateParams({ q: null }); }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Main Filter Container */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col">
        {/* Sidebar Header */}
        <div className="px-5 py-4 border-b border-border/40 bg-muted/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <span className="font-bold text-sm uppercase tracking-wider">Фильтры</span>
          </div>
          {hasActiveFilters && (
            <button 
              onClick={handleReset}
              className="text-[10px] font-bold text-muted-foreground hover:text-destructive uppercase tracking-widest transition-colors"
            >
              Сбросить
            </button>
          )}
        </div>

        <Accordion type="multiple" defaultValue={['category', 'price', 'brand']} className="w-full">
          
          {/* Categories Tree-like */}
          {categories.length > 0 && (
            <AccordionItem value="category" className="px-5 border-b border-border/30">
              <AccordionTrigger className="hover:no-underline py-4 text-[13px] font-bold uppercase tracking-widest text-foreground/80">
                Категории
              </AccordionTrigger>
              <AccordionContent className="pb-5">
                <div className="flex flex-col space-y-0.5">
                  {categories.map((cat) => {
                    const count = categoryCounts[cat.id.toString()] || 0
                    const isActive = selectedCategories.includes(cat.slug || '')
                    return (
                      <button
                        key={cat.id}
                        onClick={() => cat.slug && handleCategoryChange(cat.slug)}
                        className={cn(
                          "flex items-center justify-between w-full text-left py-2 px-3 rounded-lg transition-all text-[13px] group relative overflow-hidden",
                          isActive 
                            ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20" 
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
                          "text-[10px] px-1.5 py-0.5 rounded-full z-10 transition-colors",
                          isActive ? "bg-white/20 text-white" : "bg-muted-foreground/10 text-muted-foreground"
                        )}>
                          {count}
                        </span>
                        {isActive && <div className="absolute inset-0 bg-primary/10 animate-pulse" />}
                      </button>
                    )
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Price Range with Improved UI */}
          <AccordionItem value="price" className="px-5 border-b border-border/30">
            <AccordionTrigger className="hover:no-underline py-4 text-[13px] font-bold uppercase tracking-widest text-foreground/80">
              Цена (тг)
            </AccordionTrigger>
            <AccordionContent className="pb-7 pt-2">
              <div className="flex flex-col gap-6 px-1">
                <Slider
                  min={minPossiblePrice}
                  max={maxPossiblePrice}
                  step={100}
                  value={priceRange}
                  onValueChange={(val) => setPriceRange(val as [number, number])}
                  onValueCommit={handlePriceApply}
                  className="py-4"
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-black text-muted-foreground tracking-tighter ml-1">Минимум</label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="h-9 px-3 text-xs bg-muted/20 border-border/40 focus-visible:ring-primary/10 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-black text-muted-foreground tracking-tighter ml-1">Максимум</label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="h-9 px-3 text-xs bg-muted/20 border-border/40 focus-visible:ring-primary/10 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  size="sm" 
                  className="w-full h-9 text-[11px] uppercase tracking-[0.2em] font-black rounded-lg shadow-lg shadow-primary/10 transition-transform active:scale-[0.98]" 
                  onClick={handlePriceApply}
                >
                  Применить
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Brands with Counts and Search */}
          <AccordionItem value="brand" className="px-5 border-none">
            <AccordionTrigger className="hover:no-underline py-4 text-[13px] font-bold uppercase tracking-widest text-foreground/80">
              Бренды
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <div className="space-y-4 pt-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                  <Input
                    placeholder="Быстрый поиск..."
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    className="h-8 pl-8 text-[12px] bg-muted/20 border-none rounded-lg focus-visible:ring-1 focus-visible:ring-primary/30"
                  />
                </div>
                
                <div className="flex flex-col gap-1 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                  {visibleBrands.length > 0 ? visibleBrands.map((brand) => (
                    <label 
                      key={brand.title} 
                      className={cn(
                        "flex cursor-pointer items-center justify-between py-1.5 px-2 rounded-lg transition-colors group",
                        selectedBrands.includes(brand.title) ? "bg-primary/5" : "hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={selectedBrands.includes(brand.title)}
                          onCheckedChange={() => handleBrandChange(brand.title)}
                          className="rounded-[4px] border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <span className={cn(
                          "text-[13px] transition-colors",
                          selectedBrands.includes(brand.title) ? "text-primary font-medium" : "text-muted-foreground group-hover:text-foreground"
                        )}>
                          {brand.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground/50 bg-muted px-1.5 py-0.5 rounded-full group-hover:bg-muted-foreground/10 transition-colors">
                        {brand.count}
                      </span>
                    </label>
                  )) : (
                    <div className="text-center py-6 opacity-40">
                      <ShoppingBag className="h-8 w-8 mx-auto mb-2 stroke-1" />
                      <p className="text-[11px] uppercase tracking-tighter">Нет результатов</p>
                    </div>
                  )}
                </div>

                {filteredBrands.length > 10 && (
                  <button
                    onClick={() => setShowAllBrands(!showAllBrands)}
                    className="w-full py-2 text-[11px] font-bold text-primary uppercase tracking-widest hover:bg-primary/5 rounded-lg transition-colors border border-dashed border-primary/20 mt-2"
                  >
                    {showAllBrands ? 'Свернуть' : `Все бренды (${filteredBrands.length})`}
                  </button>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Modern Badge for "Special Offers" or similar */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-blue-600 p-5 text-white shadow-xl shadow-primary/20 group">
        <div className="relative z-10">
          <h4 className="font-bold text-sm mb-1 uppercase tracking-wider">Нужна помощь?</h4>
          <p className="text-[11px] text-white/80 leading-relaxed mb-4">
            Наши эксперты помогут подобрать идеальную сантехнику под ваш проект.
          </p>
          <Button variant="secondary" size="sm" className="w-full h-8 text-[10px] font-bold uppercase tracking-widest bg-white text-primary border-none hover:bg-white/90">
            Консультация
          </Button>
        </div>
        <div className="absolute -right-6 -bottom-6 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
        <div className="absolute -left-10 -top-10 h-32 w-32 bg-black/5 rounded-full blur-3xl" />
      </div>
    </div>
  )
}
