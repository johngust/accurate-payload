// ABOUTME: Мобильное навигационное меню (Sheet/drawer).
// ABOUTME: Включает навигацию, дерево категорий каталога и аккаунт.

'use client'

import type { Header } from '@/payload-types'
import type { CategoryTree } from './index'

import { CMSLink } from '@/components/Link'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/providers/Auth'
import { ChevronDown, MenuIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Props {
  menu: Header['navItems']
  categories: CategoryTree[]
}

export function MobileMenu({ menu, categories }: Props) {
  const { user } = useAuth()

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname, searchParams])

  const toggleCategory = (id: number) => {
    setExpandedCategory((prev) => (prev === id ? null : id))
  }

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:bg-black dark:text-white">
        <MenuIcon className="h-4" />
      </SheetTrigger>

      <SheetContent side="left" className="overflow-y-auto px-4">
        <SheetHeader className="px-0 pt-4 pb-0">
          <SheetTitle>Меню</SheetTitle>
          <SheetDescription />
        </SheetHeader>

        {/* Навигация */}
        <div className="py-4">
          {menu?.length ? (
            <ul className="flex w-full flex-col">
              {menu.map((item) => (
                <li className="py-2" key={item.id}>
                  <CMSLink {...item.link} appearance="link" />
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Категории каталога */}
        {categories.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="mb-2 font-heading text-lg font-semibold">Каталог</h3>
            <ul className="flex flex-col">
              {categories.map((cat) => (
                <li key={cat.id} className="border-b border-border last:border-b-0">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/catalog/${cat.slug}`}
                      className="flex-1 py-3 text-sm font-medium text-foreground"
                    >
                      {cat.title}
                    </Link>
                    {cat.children.length > 0 && (
                      <button
                        onClick={() => toggleCategory(cat.id)}
                        className="p-2 text-muted-foreground"
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            expandedCategory === cat.id ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>
                  {expandedCategory === cat.id && cat.children.length > 0 && (
                    <ul className="pb-2 pl-4">
                      {cat.children.map((sub) => (
                        <li key={sub.id}>
                          <Link
                            href={`/catalog/${sub.slug}`}
                            className="block py-1.5 text-sm text-muted-foreground hover:text-primary"
                          >
                            {sub.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {user ? (
          <div className="mt-4">
            <h2 className="text-xl mb-4">Мой аккаунт</h2>
            <hr className="my-2" />
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/orders">Заказы</Link>
              </li>
              <li>
                <Link href="/account/addresses">Адреса</Link>
              </li>
              <li>
                <Link href="/account">Управление аккаунтом</Link>
              </li>
              <li className="mt-6">
                <Button asChild variant="outline">
                  <Link href="/logout">Выйти</Link>
                </Button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="mt-4">
            <h2 className="text-xl mb-4">Мой аккаунт</h2>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button asChild className="w-full sm:flex-1" variant="outline">
                <Link href="/login">Войти</Link>
              </Button>
              <span className="text-center text-sm text-muted-foreground sm:text-base">или</span>
              <Button asChild className="w-full sm:flex-1">
                <Link href="/create-account">Создать аккаунт</Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
