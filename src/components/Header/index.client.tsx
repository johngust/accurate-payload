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

type Props = {
  header: Header
  categories: CategoryTree[]
}

export function HeaderClient({ header, categories }: Props) {
  const menu = header.navItems || []
  const pathname = usePathname()

  return (
    <div className="relative z-20 border-b">
      <nav className="flex items-center md:items-end justify-between container pt-2">
        <div className="block flex-none md:hidden">
          <Suspense fallback={null}>
            <MobileMenu menu={menu} categories={categories} />
          </Suspense>
        </div>
        <div className="flex w-full items-end justify-between">
          <div className="flex w-full items-end gap-4 md:w-2/3">
            <Link className="flex w-full items-center justify-center pt-4 pb-4 md:w-auto" href="/">
              <LogoIcon className="w-6 h-auto" />
            </Link>

            {/* Кнопка каталога — только десктоп */}
            <div className="hidden md:flex items-end pb-3">
              <CatalogMenu categories={categories} />
            </div>

            {menu.length ? (
              <ul className="hidden gap-4 text-sm md:flex md:items-center">
                {menu
                  .filter((item) => item.link.url !== '/catalog')
                  .map((item) => (
                    <li key={item.id}>
                      <CMSLink
                        {...item.link}
                        size={'clear'}
                        className={cn('relative navLink', {
                          active:
                            item.link.url && item.link.url !== '/'
                              ? pathname.includes(item.link.url)
                              : false,
                        })}
                        appearance="nav"
                      />
                    </li>
                  ))}
              </ul>
            ) : null}
          </div>

          <div className="flex justify-end md:w-1/3 gap-4">
            <Suspense fallback={<OpenCartButton />}>
              <Cart />
            </Suspense>
          </div>
        </div>
      </nav>
    </div>
  )
}
