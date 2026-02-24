// ABOUTME: Мега-меню каталога — выпадающая панель с деревом категорий.
// ABOUTME: Слева корневые категории, справа подкатегории при наведении.

'use client'

import type { CategoryTree } from './index'

import { cn } from '@/utilities/cn'
import { LayoutGrid } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from 'react'

type Props = {
  categories: CategoryTree[]
}

export function CatalogMenu({ categories }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Закрываем при смене маршрута
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Закрываем по клику вне меню
  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  // Закрываем по Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen])

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev)
    setActiveIndex(0)
  }, [])

  if (categories.length === 0) return null

  const activeCategory = categories[activeIndex]

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={toggle}
        className={cn(
          'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
          'bg-primary text-primary-foreground hover:bg-primary/90',
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        Каталог
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-50 flex w-[700px] rounded-xl border border-border bg-card shadow-xl">
          {/* Левая колонка — корневые категории */}
          <div className="w-1/3 border-r border-border py-2">
            {categories.map((cat, index) => (
              <Link
                key={cat.id}
                href={`/catalog/${cat.slug}`}
                className={cn(
                  'flex items-center px-4 py-2.5 text-sm transition-colors',
                  index === activeIndex
                    ? 'bg-secondary text-primary font-medium'
                    : 'text-foreground hover:bg-secondary/50',
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => setIsOpen(false)}
              >
                {cat.title}
              </Link>
            ))}
          </div>

          {/* Правая колонка — подкатегории */}
          <div className="flex-1 p-4">
            {activeCategory && (
              <>
                <Link
                  href={`/catalog/${activeCategory.slug}`}
                  className="mb-3 block font-heading text-lg font-semibold text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {activeCategory.title}
                </Link>
                {activeCategory.children.length > 0 ? (
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {activeCategory.children.map((sub) => (
                      <li key={sub.id}>
                        <Link
                          href={`/catalog/${sub.slug}`}
                          className="block py-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          {sub.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Нет подкатегорий</p>
                )}
                <Link
                  href={`/catalog/${activeCategory.slug}`}
                  className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
                  onClick={() => setIsOpen(false)}
                >
                  Смотреть все →
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
