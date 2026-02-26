// ABOUTME: Клиентский компонент Header — навигация, кнопка каталога, корзина.
// ABOUTME: Получает данные от серверного Header компонента.

'use client'

import type { Header } from 'src/payload-types'
import type { CategoryTree } from './index'

import { Cart } from '@/components/Cart'
import { OpenCartButton } from '@/components/Cart/OpenCart'
import { LogoIcon } from '@/components/icons/logo'
import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/cn'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { Suspense } from 'react'

import { CatalogMenu } from './CatalogMenu.client'
import { MobileMenu } from './MobileMenu'
import { Search } from '@/components/Search'
import { User, Heart, BarChart2, MapPin, Phone } from 'lucide-react'

type Props = {
  header: Header
  categories: CategoryTree[]
}

export function HeaderClient({ header, categories }: Props) {
  const menu = header.navItems || []
  const pathname = usePathname()

  return (
    <div className="relative z-20">
      {/* Top Bar */}
      <div className="bg-secondary py-1 text-xs border-b">
        <div className="container flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <button className="flex items-center gap-1 hover:text-primary transition-colors">
              <MapPin className="h-3 w-3" />
              <span>Алматы</span>
            </button>
            <div className="hidden sm:flex gap-4 text-muted-foreground">
              <Link href="/delivery" className="hover:text-primary transition-colors">Доставка</Link>
              <Link href="/installation" className="hover:text-primary transition-colors">Установка</Link>
              <Link href="/design" className="hover:text-primary transition-colors">Дизайн-проект</Link>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <a href="tel:+77001234567" className="font-bold flex items-center gap-1">
              <Phone className="h-3 w-3" />
              +7 (700) 123-45-67
            </a>
            <div className="hidden lg:flex gap-4">
              <Link href="/about" className="hover:text-primary transition-colors">О компании</Link>
              <Link href="/contacts" className="hover:text-primary transition-colors">Контакты</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <nav className="border-b bg-background">
        <div className="container py-4 flex flex-col md:flex-row items-center gap-4 lg:gap-8">
          <div className="flex w-full items-center justify-between md:w-auto md:gap-4">
            <div className="md:hidden">
              <Suspense fallback={null}>
                <MobileMenu menu={menu} categories={categories} />
              </Suspense>
            </div>
            
            <Link href="/" className="flex-shrink-0">
              <div className="flex items-center gap-2">
                <LogoIcon className="w-8 h-8 text-primary" />
                <span className="text-xl font-bold tracking-tight text-primary hidden sm:block">
                  ACCURATE<span className="text-foreground">.KZ</span>
                </span>
              </div>
            </Link>

            <div className="md:hidden">
              <Suspense fallback={<OpenCartButton />}>
                <Cart />
              </Suspense>
            </div>
          </div>

          <div className="flex flex-1 items-center w-full gap-4">
            <div className="hidden md:block">
              <CatalogMenu categories={categories} />
            </div>
            
            <div className="flex-1 max-w-2xl">
              <Search className="w-full" />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/compare" className="flex flex-col items-center text-muted-foreground hover:text-primary transition-colors">
              <BarChart2 className="h-6 w-6" />
              <span className="text-[10px] mt-1">Сравнение</span>
            </Link>
            <Link href="/favorites" className="flex flex-col items-center text-muted-foreground hover:text-primary transition-colors">
              <Heart className="h-6 w-6" />
              <span className="text-[10px] mt-1">Избранное</span>
            </Link>
            <Link href="/account" className="flex flex-col items-center text-muted-foreground hover:text-primary transition-colors">
              <User className="h-6 w-6" />
              <span className="text-[10px] mt-1">Войти</span>
            </Link>
            <Suspense fallback={<OpenCartButton />}>
              <Cart />
            </Suspense>
          </div>
        </div>
      </nav>
    </div>
  )
}
