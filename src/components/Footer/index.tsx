// ABOUTME: Компонент Footer — отображает навигационные колонки со ссылками и контактную информацию.
// ABOUTME: Поддерживает два режима: колоночный макет (columns) и fallback на navItems.

import type { Footer as FooterType } from '@/payload-types'

import { FooterMenu } from '@/components/Footer/menu'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import { Suspense } from 'react'

export async function Footer() {
  const footer: FooterType = await getCachedGlobal('footer', 1)()
  const { navItems, columns, contactPhone, contactEmail } = footer
  const hasColumns = columns && columns.length > 0

  return (
    <footer className="border-t bg-card">
      <div className="container py-12">
        {hasColumns ? (
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {columns.map((col) => (
              <div key={col.id}>
                <h3 className="mb-4 font-heading text-sm font-bold">{col.title}</h3>
                <ul className="space-y-2">
                  {col.links?.map((link) => (
                    <li key={link.id}>
                      <Link
                        href={link.url}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {(contactPhone || contactEmail) && (
              <div>
                <h3 className="mb-4 font-heading text-sm font-bold">Контакты</h3>
                {contactPhone && <p className="text-lg font-bold">{contactPhone}</p>}
                {contactEmail && (
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {contactEmail}
                  </a>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex w-full flex-col gap-6 text-sm md:flex-row md:gap-12">
            <Suspense
              fallback={
                <div className="flex h-[188px] w-[200px] flex-col gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-6 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"
                    />
                  ))}
                </div>
              }
            >
              <FooterMenu menu={navItems || []} />
            </Suspense>
            <div className="flex flex-col items-end gap-4 md:ml-auto">
              <ThemeSelector />
            </div>
          </div>
        )}
      </div>
      <div className="border-t py-6">
        <div className="container text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Accurate.kz. Все права защищены.
        </div>
      </div>
    </footer>
  )
}
