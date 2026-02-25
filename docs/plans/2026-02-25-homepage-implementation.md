# Homepage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a homepage that replicates santehnika-online.ru structure: 14 sections with promotions, category navigation, product carousels, brands, and redesigned footer.

**Architecture:** 3 new Payload collections (Promotions, FeaturedProducts, Brands) provide reusable promo content. 9 new layout builder blocks render sections. Hero area is an auto-component in the page template, not a block. Footer is a redesigned Global component. Seed script creates home page with all blocks populated.

**Tech Stack:** Payload CMS 3.76, Next.js 15 App Router, embla-carousel + auto-scroll, Tailwind CSS 4, Lucide icons, shadcn/ui

---

## Phase 1: New Collections

### Task 1: Create Promotions collection

**Files:**
- Create: `src/collections/Promotions.ts`
- Modify: `src/payload.config.ts` — add to collections array

**Step 1: Create collection file**

```typescript
// ABOUTME: Коллекция промо-баннеров для слайдеров, акций и промо-сеток.
// ABOUTME: Переиспользуется на главной, в категориях и других страницах.

import type { CollectionConfig } from 'payload'

export const Promotions: CollectionConfig = {
  slug: 'promotions',
  labels: { singular: 'Промо-акция', plural: 'Промо-акции' },
  access: { read: () => true },
  admin: { useAsTitle: 'title', group: 'Промо' },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Заголовок' },
    { name: 'subtitle', type: 'text', label: 'Подзаголовок' },
    { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Изображение' },
    {
      name: 'link',
      type: 'group',
      fields: [
        { name: 'url', type: 'text', label: 'URL' },
        { name: 'label', type: 'text', label: 'Текст кнопки' },
      ],
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'banner',
      label: 'Тип',
      options: [
        { label: 'Hero-слайд', value: 'hero' },
        { label: 'Баннер', value: 'banner' },
        { label: 'Акция', value: 'sale' },
      ],
    },
    { name: 'active', type: 'checkbox', defaultValue: true, label: 'Активна' },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: 'Категории (пусто = глобальная)',
    },
  ],
}
```

**Step 2: Register in payload.config.ts**

Add import and add to collections array after Media.

**Step 3: Run `pnpm generate:types`**

**Step 4: Run `npx tsc --noEmit` to verify**

**Step 5: Commit**

```
feat: add Promotions collection for reusable promo banners
```

---

### Task 2: Create FeaturedProducts collection

**Files:**
- Create: `src/collections/FeaturedProducts.ts`
- Modify: `src/payload.config.ts`

**Step 1: Create collection file**

```typescript
// ABOUTME: Коллекция «Товаров дня» — компактные карточки со скидкой.
// ABOUTME: Привязываются к категориям для показа на разных страницах.

import type { CollectionConfig } from 'payload'

export const FeaturedProducts: CollectionConfig = {
  slug: 'featuredProducts',
  labels: { singular: 'Товар дня', plural: 'Товары дня' },
  access: { read: () => true },
  admin: { useAsTitle: 'title', group: 'Промо' },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Заголовок', defaultValue: 'Товар дня' },
    { name: 'product', type: 'relationship', relationTo: 'products', required: true, label: 'Товар' },
    { name: 'discountPercent', type: 'number', min: 1, max: 99, label: 'Скидка %' },
    { name: 'active', type: 'checkbox', defaultValue: true, label: 'Активен' },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: 'Категории (пусто = глобальный)',
    },
  ],
}
```

**Step 2: Register in payload.config.ts**

**Step 3: Run `pnpm generate:types` and `npx tsc --noEmit`**

**Step 4: Commit**

```
feat: add FeaturedProducts collection for "product of the day" cards
```

---

### Task 3: Create Brands collection

**Files:**
- Create: `src/collections/Brands.ts`
- Modify: `src/payload.config.ts`

**Step 1: Create collection file**

```typescript
// ABOUTME: Коллекция брендов с логотипами для отображения на главной и в каталоге.
// ABOUTME: Логотипы отображаются в горизонтальной сетке.

import type { CollectionConfig } from 'payload'

export const Brands: CollectionConfig = {
  slug: 'brands',
  labels: { singular: 'Бренд', plural: 'Бренды' },
  access: { read: () => true },
  admin: { useAsTitle: 'name', group: 'Контент' },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Название' },
    { name: 'logo', type: 'upload', relationTo: 'media', label: 'Логотип' },
    {
      name: 'link',
      type: 'group',
      fields: [
        { name: 'url', type: 'text', label: 'URL' },
      ],
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0, label: 'Порядок' },
  ],
}
```

**Step 2: Register in payload.config.ts**

**Step 3: Run `pnpm generate:types` and `npx tsc --noEmit`**

**Step 4: Commit**

```
feat: add Brands collection for brand logos display
```

---

## Phase 2: Hero Auto-Component

### Task 4: Create Hero component

The Hero renders automatically in the page template before layout blocks. It fetches active Promotions (type=hero) and FeaturedProducts from collections.

**Files:**
- Create: `src/components/Hero/index.tsx` — серверный компонент
- Create: `src/components/Hero/PromoSlider.client.tsx` — клиентский слайдер
- Create: `src/components/Hero/FeaturedProductCard.tsx` — карточка товара дня
- Modify: `src/app/(app)/[slug]/page.tsx` — рендер Hero вместо RenderHero для home page

**Step 1: Create PromoSlider client component**

```typescript
// src/components/Hero/PromoSlider.client.tsx
'use client'
// ABOUTME: Клиентский компонент слайдера промо-баннеров в Hero-секции.
// ABOUTME: Использует embla-carousel с автопрокруткой и точками-индикаторами.

import type { Media as MediaType, Promotion } from '@/payload-types'
import { Media } from '@/components/Media'
import Link from 'next/link'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel'
import AutoPlay from 'embla-carousel-autoplay'
import { useState, useEffect, useCallback } from 'react'

type Props = {
  promotions: Promotion[]
}

export const PromoSlider: React.FC<Props> = ({ promotions }) => {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  const onSelect = useCallback(() => {
    if (!api) return
    setCurrent(api.selectedScrollSnap())
  }, [api])

  useEffect(() => {
    if (!api) return
    onSelect()
    api.on('select', onSelect)
    return () => { api.off('select', onSelect) }
  }, [api, onSelect])

  if (!promotions.length) return null

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <Carousel
        setApi={setApi}
        opts={{ align: 'start', loop: true }}
        plugins={[AutoPlay({ delay: 5000, stopOnInteraction: true })]}
        className="w-full"
      >
        <CarouselContent>
          {promotions.map((promo) => {
            const image = typeof promo.image === 'object' ? promo.image : undefined
            const Wrapper = promo.link?.url ? Link : 'div'
            const wrapperProps = promo.link?.url ? { href: promo.link.url } : {}

            return (
              <CarouselItem key={promo.id} className="relative aspect-[16/9] w-full">
                <Wrapper {...(wrapperProps as any)} className="relative block h-full w-full">
                  {image && (
                    <Media
                      resource={image}
                      imgClassName="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h2 className="text-2xl font-bold">{promo.title}</h2>
                    {promo.subtitle && (
                      <p className="mt-1 text-sm opacity-90">{promo.subtitle}</p>
                    )}
                    {promo.link?.label && (
                      <span className="mt-3 inline-block rounded-lg bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                        {promo.link.label}
                      </span>
                    )}
                  </div>
                </Wrapper>
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>
      {/* Dots */}
      {promotions.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {promotions.map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === current ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Create FeaturedProductCard component**

```typescript
// src/components/Hero/FeaturedProductCard.tsx
// ABOUTME: Компактная карточка «Товар дня» со скидкой для Hero-секции.
// ABOUTME: Показывает товар, процент скидки и зачёркнутую старую цену.

import type { FeaturedProduct, Product, Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import Link from 'next/link'

type Props = {
  featured: FeaturedProduct
}

export const FeaturedProductCard: React.FC<Props> = ({ featured }) => {
  const product = typeof featured.product === 'object' ? featured.product : null
  if (!product) return null

  const image =
    product.gallery?.[0]?.image && typeof product.gallery[0].image === 'object'
      ? product.gallery[0].image
      : undefined

  const price = product.priceInUSD
  const oldPrice =
    featured.discountPercent && price
      ? Math.round(price / (1 - featured.discountPercent / 100))
      : undefined

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-heading text-sm font-bold text-primary">{featured.title}</span>
        {featured.discountPercent && (
          <span className="rounded-full bg-destructive px-2.5 py-0.5 text-xs font-bold text-white">
            -{featured.discountPercent}%
          </span>
        )}
      </div>

      <Link href={`/products/${product.slug}`} className="relative mb-3 block aspect-square w-full">
        {image && (
          <Media
            resource={image}
            imgClassName="absolute inset-0 h-full w-full object-contain"
          />
        )}
      </Link>

      <Link href={`/products/${product.slug}`}>
        <h3 className="mb-2 line-clamp-2 text-sm font-medium">{product.title}</h3>
      </Link>

      <div className="mt-auto flex items-baseline gap-2">
        {typeof price === 'number' && (
          <span className="font-heading text-xl font-bold">
            <Price amount={price} />
          </span>
        )}
        {oldPrice && (
          <span className="text-sm text-muted-foreground line-through">
            <Price amount={oldPrice} />
          </span>
        )}
      </div>
    </div>
  )
}
```

**Step 3: Create Hero server component**

```typescript
// src/components/Hero/index.tsx
// ABOUTME: Серверный компонент Hero-секции — промо-слайдер + товар дня.
// ABOUTME: Автоматически тянет данные из коллекций Promotions и FeaturedProducts.

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { PromoSlider } from './PromoSlider.client'
import { FeaturedProductCard } from './FeaturedProductCard'

type Props = {
  categoryId?: number
}

export const Hero: React.FC<Props> = async ({ categoryId }) => {
  const payload = await getPayload({ config: configPromise })

  const promoWhere: any = {
    and: [
      { active: { equals: true } },
      { type: { equals: 'hero' } },
    ],
  }
  if (categoryId) {
    promoWhere.and.push({ categories: { contains: categoryId } })
  } else {
    promoWhere.and.push({
      or: [
        { categories: { exists: false } },
        { 'categories.length': { equals: 0 } },
      ],
    })
  }

  const [promotions, featuredProducts] = await Promise.all([
    payload.find({
      collection: 'promotions',
      where: promoWhere,
      limit: 6,
      depth: 1,
    }),
    payload.find({
      collection: 'featuredProducts',
      where: { active: { equals: true } },
      limit: 1,
      depth: 2,
    }),
  ])

  if (!promotions.docs.length && !featuredProducts.docs.length) return null

  const featured = featuredProducts.docs[0]

  return (
    <section className="container pb-6 pt-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <PromoSlider promotions={promotions.docs} />
        {featured && <FeaturedProductCard featured={featured} />}
      </div>
    </section>
  )
}
```

**Step 4: Modify page template to render Hero for home page**

In `src/app/(app)/[slug]/page.tsx`, import and render `<Hero />` before `<RenderBlocks>` when slug is `home` (or when hero type is `none`). The existing `RenderHero` stays for other pages.

```typescript
import { Hero } from '@/components/Hero'

// Inside the component, after getting page data:
const isHomePage = slug === 'home'

return (
  <article className="pt-16 pb-24">
    {isHomePage ? <Hero /> : <RenderHero {...hero} />}
    <RenderBlocks blocks={layout} />
  </article>
)
```

**Step 5: Check `embla-carousel-autoplay` is installed**

Run: `pnpm list embla-carousel-autoplay 2>/dev/null || pnpm add embla-carousel-autoplay`

Note: existing code uses `embla-carousel-auto-scroll`. AutoPlay is a different plugin (pause/resume vs continuous scroll). Check if already installed, install if not.

**Step 6: Run `pnpm generate:types`, `pnpm generate:importmap`, `npx tsc --noEmit`**

**Step 7: Commit**

```
feat: add Hero auto-component with promo slider and featured product card
```

---

## Phase 3: New Layout Blocks

### Task 5: CategoryIconsRow block

Horizontal scrollable row of root category icons.

**Files:**
- Create: `src/blocks/CategoryIconsRow/config.ts`
- Create: `src/blocks/CategoryIconsRow/Component.tsx`
- Modify: `src/collections/Pages/index.ts` — add to blocks array
- Modify: `src/blocks/RenderBlocks.tsx` — add to blockComponents

**Step 1: Create config**

```typescript
// src/blocks/CategoryIconsRow/config.ts
// ABOUTME: Конфигурация блока горизонтального ряда иконок категорий.
// ABOUTME: Отображает корневые категории с маленькими иконками для быстрой навигации.

import type { Block } from 'payload'

export const CategoryIconsRow: Block = {
  slug: 'categoryIconsRow',
  labels: { singular: 'Ряд иконок категорий', plural: 'Ряды иконок категорий' },
  fields: [
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: 'Категории (пусто = все корневые)',
    },
  ],
}
```

**Step 2: Create component**

```typescript
// src/blocks/CategoryIconsRow/Component.tsx
// ABOUTME: Горизонтальный прокручиваемый ряд иконок корневых категорий.
// ABOUTME: Категория — маленькая иконка 48px + название. Быстрая навигация по каталогу.

import type { Category, CategoryIconsRowBlock } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { Media } from '@/components/Media'

export const CategoryIconsRowBlock: React.FC<CategoryIconsRowBlock> = async ({ categories }) => {
  let cats: Category[] = []

  if (categories?.length) {
    cats = categories
      .map((c) => (typeof c === 'object' ? c : null))
      .filter(Boolean) as Category[]
  } else {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'categories',
      where: { parent: { exists: false } },
      limit: 12,
      depth: 1,
    })
    cats = result.docs
  }

  if (!cats.length) return null

  return (
    <section className="container py-4">
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {cats.map((cat) => {
          const image =
            cat.image && typeof cat.image === 'object' ? cat.image : undefined
          return (
            <Link
              key={cat.id}
              href={`/catalog/${cat.slug}`}
              className="flex shrink-0 flex-col items-center gap-2 rounded-xl px-3 py-2 transition-colors hover:bg-secondary"
            >
              {image ? (
                <div className="h-12 w-12">
                  <Media
                    resource={image}
                    imgClassName="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-lg font-bold text-muted-foreground">
                  {cat.title.charAt(0)}
                </div>
              )}
              <span className="max-w-[80px] text-center text-xs font-medium leading-tight">
                {cat.title}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
```

**Step 3: Register in Pages collection and RenderBlocks**

In `src/collections/Pages/index.ts` — import and add `CategoryIconsRow` to blocks array.
In `src/blocks/RenderBlocks.tsx` — import `CategoryIconsRowBlock` and add `categoryIconsRow: CategoryIconsRowBlock` to `blockComponents`.

**Step 4: Run `pnpm generate:types`, `pnpm generate:importmap`, `npx tsc --noEmit`**

**Step 5: Commit**

```
feat: add CategoryIconsRow layout block
```

---

### Task 6: PromoBanners block

Row of 3 promo cards pulling from Promotions collection.

**Files:**
- Create: `src/blocks/PromoBanners/config.ts`
- Create: `src/blocks/PromoBanners/Component.tsx`
- Modify: `src/collections/Pages/index.ts`
- Modify: `src/blocks/RenderBlocks.tsx`

**Step 1: Create config**

```typescript
// src/blocks/PromoBanners/config.ts
// ABOUTME: Конфигурация блока промо-баннеров в ряд (3-4 карточки).
// ABOUTME: Отображает промо-акции из коллекции Promotions.

import type { Block } from 'payload'

export const PromoBanners: Block = {
  slug: 'promoBanners',
  labels: { singular: 'Промо-баннеры', plural: 'Промо-баннеры' },
  fields: [
    {
      name: 'source',
      type: 'select',
      defaultValue: 'all_active',
      label: 'Источник',
      options: [
        { label: 'Все активные баннеры', value: 'all_active' },
        { label: 'Выбрать вручную', value: 'manual' },
      ],
    },
    {
      name: 'promotions',
      type: 'relationship',
      relationTo: 'promotions',
      hasMany: true,
      maxRows: 4,
      label: 'Промо-акции',
      admin: {
        condition: (_, siblingData) => siblingData.source === 'manual',
      },
    },
  ],
}
```

**Step 2: Create component**

```typescript
// src/blocks/PromoBanners/Component.tsx
// ABOUTME: Ряд из 3 промо-карточек с изображением и заголовком.
// ABOUTME: Тянет данные из коллекции Promotions по типу «banner».

import type { Promotion, PromoBannersBlock as Props } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { Media } from '@/components/Media'

export const PromoBannersBlock: React.FC<Props> = async ({ source, promotions }) => {
  let promos: Promotion[] = []

  if (source === 'manual' && promotions?.length) {
    promos = promotions
      .map((p) => (typeof p === 'object' ? p : null))
      .filter(Boolean) as Promotion[]
  } else {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'promotions',
      where: { and: [{ active: { equals: true } }, { type: { equals: 'banner' } }] },
      limit: 4,
      depth: 1,
    })
    promos = result.docs
  }

  if (!promos.length) return null

  return (
    <section className="container py-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promos.map((promo) => {
          const image = typeof promo.image === 'object' ? promo.image : undefined
          const Wrapper = promo.link?.url ? Link : 'div'
          const wrapperProps = promo.link?.url ? { href: promo.link.url } : {}

          return (
            <Wrapper
              key={promo.id}
              {...(wrapperProps as any)}
              className="group relative aspect-[16/9] overflow-hidden rounded-2xl"
            >
              {image && (
                <Media
                  resource={image}
                  imgClassName="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-lg font-bold">{promo.title}</h3>
                {promo.subtitle && (
                  <p className="mt-0.5 text-sm opacity-80">{promo.subtitle}</p>
                )}
              </div>
            </Wrapper>
          )
        })}
      </div>
    </section>
  )
}
```

**Step 3: Register in Pages and RenderBlocks**

**Step 4: Run `pnpm generate:types`, `pnpm generate:importmap`, `npx tsc --noEmit`**

**Step 5: Commit**

```
feat: add PromoBanners layout block
```

---

### Task 7: CategoryProductTabs block

Tabs showing category names; clicking tab shows 4 product cards from that category. Client component with server-fetched initial data.

**Files:**
- Create: `src/blocks/CategoryProductTabs/config.ts`
- Create: `src/blocks/CategoryProductTabs/Component.tsx`
- Create: `src/blocks/CategoryProductTabs/Tabs.client.tsx`
- Modify: `src/collections/Pages/index.ts`
- Modify: `src/blocks/RenderBlocks.tsx`

**Step 1: Create config**

```typescript
// src/blocks/CategoryProductTabs/config.ts
// ABOUTME: Конфигурация блока подборки товаров по категориям с табами.
// ABOUTME: Переключение табов показывает товары из выбранной категории.

import type { Block } from 'payload'

export const CategoryProductTabs: Block = {
  slug: 'categoryProductTabs',
  labels: { singular: 'Подборка по категориям', plural: 'Подборки по категориям' },
  fields: [
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      required: true,
      label: 'Категории (табы)',
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 4,
      label: 'Товаров на таб',
      admin: { step: 1 },
    },
  ],
}
```

**Step 2: Create server component that pre-fetches first tab**

```typescript
// src/blocks/CategoryProductTabs/Component.tsx
// ABOUTME: Серверный компонент подборки товаров по категориям.
// ABOUTME: Предзагружает товары первой категории, остальные подгружаются клиентом.

import type { Category, Product, CategoryProductTabsBlock as Props } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { TabsClient } from './Tabs.client'

export const CategoryProductTabsBlock: React.FC<Props> = async ({ categories, limit = 4 }) => {
  if (!categories?.length) return null

  const cats = categories
    .map((c) => (typeof c === 'object' ? c : null))
    .filter(Boolean) as Category[]

  if (!cats.length) return null

  const payload = await getPayload({ config: configPromise })

  // Pre-fetch products for first category
  const firstCat = cats[0]
  const result = await payload.find({
    collection: 'products',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { categories: { contains: firstCat.id } },
      ],
    },
    limit,
    depth: 1,
    select: {
      title: true, slug: true, gallery: true,
      priceInUSD: true, inStock: true, rating: true,
    },
  })

  const tabsData = cats.map((cat) => ({
    id: cat.id,
    title: cat.title,
    slug: cat.slug,
  }))

  return (
    <section className="container py-8">
      <TabsClient
        tabs={tabsData}
        initialProducts={result.docs as Product[]}
        limit={limit}
      />
    </section>
  )
}
```

**Step 3: Create client component with tab switching**

```typescript
// src/blocks/CategoryProductTabs/Tabs.client.tsx
'use client'
// ABOUTME: Клиентский компонент табов подборки товаров по категориям.
// ABOUTME: Переключение табов загружает товары через API-запрос к Payload REST.

import type { Product } from '@/payload-types'
import { ProductGridItem } from '@/components/ProductGridItem'
import { useState, useCallback } from 'react'
import { cn } from '@/utilities/ui'

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
      {/* Tabs */}
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

      {/* Products grid */}
      <div className={cn('grid grid-cols-2 gap-4 md:grid-cols-4', loading && 'opacity-50')}>
        {products.map((product) => (
          <ProductGridItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
```

**Step 4: Register in Pages and RenderBlocks**

**Step 5: Run `pnpm generate:types`, `pnpm generate:importmap`, `npx tsc --noEmit`**

**Step 6: Commit**

```
feat: add CategoryProductTabs layout block with client-side tab switching
```

---

### Task 8: BrandsBlock

**Files:**
- Create: `src/blocks/BrandsBlock/config.ts`
- Create: `src/blocks/BrandsBlock/Component.tsx`
- Modify: `src/collections/Pages/index.ts`
- Modify: `src/blocks/RenderBlocks.tsx`

**Step 1: Create config**

```typescript
// src/blocks/BrandsBlock/config.ts
// ABOUTME: Конфигурация блока логотипов брендов.
// ABOUTME: Горизонтальная сетка логотипов из коллекции Brands.

import type { Block } from 'payload'

export const BrandsBlock: Block = {
  slug: 'brandsBlock',
  labels: { singular: 'Блок брендов', plural: 'Блоки брендов' },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Только оригинальные бренды',
      label: 'Заголовок',
    },
  ],
}
```

**Step 2: Create component — fetches all brands**

```typescript
// src/blocks/BrandsBlock/Component.tsx
// ABOUTME: Горизонтальная сетка логотипов брендов.
// ABOUTME: Тянет все бренды из коллекции Brands, отсортированные по sortOrder.

import type { BrandsBlockBlock as Props } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { Media } from '@/components/Media'

export const BrandsBlockComponent: React.FC<Props> = async ({ title }) => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'brands',
    sort: 'sortOrder',
    limit: 20,
    depth: 1,
  })

  if (!result.docs.length) return null

  return (
    <section className="container py-8">
      <div className="flex items-center justify-between mb-6">
        {title && <h2 className="font-heading text-xl font-bold">{title}</h2>}
        <Link href="/brands" className="text-sm font-medium text-primary hover:underline">
          Все бренды
        </Link>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-8">
        {result.docs.map((brand) => {
          const logo = brand.logo && typeof brand.logo === 'object' ? brand.logo : undefined
          const content = logo ? (
            <Media resource={logo} imgClassName="h-10 w-auto object-contain grayscale transition-all hover:grayscale-0" />
          ) : (
            <span className="text-lg font-bold text-muted-foreground">{brand.name}</span>
          )

          return brand.link?.url ? (
            <Link key={brand.id} href={brand.link.url} className="shrink-0">
              {content}
            </Link>
          ) : (
            <div key={brand.id} className="shrink-0">{content}</div>
          )
        })}
      </div>
    </section>
  )
}
```

**Step 3: Register in Pages and RenderBlocks**

**Step 4: Run `pnpm generate:types`, `pnpm generate:importmap`, `npx tsc --noEmit`**

**Step 5: Commit**

```
feat: add BrandsBlock layout block
```

---

### Task 9: SaleWithCarousel block

Large promo banner on left + product carousel on right.

**Files:**
- Create: `src/blocks/SaleWithCarousel/config.ts`
- Create: `src/blocks/SaleWithCarousel/Component.tsx`
- Modify: `src/collections/Pages/index.ts`
- Modify: `src/blocks/RenderBlocks.tsx`

**Step 1: Create config**

```typescript
// src/blocks/SaleWithCarousel/config.ts
// ABOUTME: Конфигурация блока «Большая акция + карусель товаров».
// ABOUTME: Промо-баннер слева, карусель товаров справа.

import type { Block } from 'payload'

export const SaleWithCarousel: Block = {
  slug: 'saleWithCarousel',
  labels: { singular: 'Акция с каруселью', plural: 'Акции с каруселями' },
  fields: [
    {
      name: 'promotion',
      type: 'relationship',
      relationTo: 'promotions',
      required: true,
      label: 'Промо-акция (баннер)',
    },
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'collection',
      options: [
        { label: 'По категории', value: 'collection' },
        { label: 'Вручную', value: 'selection' },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Категория товаров',
      admin: { condition: (_, s) => s.populateBy === 'collection' },
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      label: 'Товары',
      admin: { condition: (_, s) => s.populateBy === 'selection' },
    },
    { name: 'limit', type: 'number', defaultValue: 8, label: 'Лимит товаров' },
  ],
}
```

**Step 2: Create component**

Server component that fetches data and renders: left side = promo banner image with overlay text; right side = reuses `CarouselClient` from existing Carousel block.

```typescript
// src/blocks/SaleWithCarousel/Component.tsx
// ABOUTME: Блок «Большая акция + карусель товаров».
// ABOUTME: Слева промо-баннер 40%, справа карусель товаров 60%.

import type { Product, Promotion, SaleWithCarouselBlock as Props } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { Media } from '@/components/Media'
import { CarouselClient } from '@/blocks/Carousel/Component.client'

export const SaleWithCarouselBlock: React.FC<Props> = async (props) => {
  const { promotion, populateBy, category, products: selectedProducts, limit = 8 } = props

  const promo = typeof promotion === 'object' ? promotion : null
  if (!promo) return null

  const payload = await getPayload({ config: configPromise })
  let productDocs: Product[] = []

  if (populateBy === 'selection' && selectedProducts?.length) {
    productDocs = selectedProducts
      .map((p) => (typeof p === 'object' ? p : null))
      .filter(Boolean) as Product[]
  } else if (category) {
    const catId = typeof category === 'object' ? category.id : category
    const result = await payload.find({
      collection: 'products',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { categories: { contains: catId } },
        ],
      },
      limit,
      depth: 1,
    })
    productDocs = result.docs
  }

  const image = typeof promo.image === 'object' ? promo.image : undefined

  return (
    <section className="container py-8">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_3fr]">
        {/* Promo banner */}
        <Link
          href={promo.link?.url || '#'}
          className="group relative flex aspect-[3/4] items-end overflow-hidden rounded-2xl lg:aspect-auto"
        >
          {image && (
            <Media
              resource={image}
              imgClassName="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="relative p-6 text-white">
            <h2 className="text-2xl font-bold">{promo.title}</h2>
            {promo.subtitle && <p className="mt-1 opacity-90">{promo.subtitle}</p>}
            {promo.link?.label && (
              <span className="mt-3 inline-block rounded-lg bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                {promo.link.label}
              </span>
            )}
          </div>
        </Link>

        {/* Product carousel */}
        {productDocs.length > 0 && <CarouselClient products={productDocs} />}
      </div>
    </section>
  )
}
```

**Step 3: Register in Pages and RenderBlocks**

**Step 4: Run generation and type check**

**Step 5: Commit**

```
feat: add SaleWithCarousel layout block
```

---

### Task 10: ServiceCards block

3 info cards (Рассрочка, Установка, Доставка). Similar to ServicesBlock but styled differently — horizontal cards with icon + title + short description.

**Files:**
- Create: `src/blocks/ServiceCards/config.ts`
- Create: `src/blocks/ServiceCards/Component.tsx`
- Modify: Pages collection and RenderBlocks

**Step 1: Create config**

```typescript
// src/blocks/ServiceCards/config.ts
// ABOUTME: Конфигурация блока сервисных карточек (рассрочка, установка, доставка).
// ABOUTME: 3 горизонтальные карточки с иконкой, заголовком и описанием.

import type { Block } from 'payload'

export const ServiceCards: Block = {
  slug: 'serviceCards',
  labels: { singular: 'Сервисные карточки', plural: 'Сервисные карточки' },
  fields: [
    {
      name: 'cards',
      type: 'array',
      maxRows: 4,
      fields: [
        { name: 'iconName', type: 'text', required: true, label: 'Иконка (Lucide)' },
        { name: 'title', type: 'text', required: true, label: 'Заголовок' },
        { name: 'description', type: 'text', label: 'Описание' },
        {
          name: 'link',
          type: 'group',
          fields: [
            { name: 'url', type: 'text', label: 'URL' },
          ],
        },
      ],
    },
  ],
}
```

**Step 2: Create component**

```typescript
// src/blocks/ServiceCards/Component.tsx
// ABOUTME: Ряд из 3 сервисных карточек с иконками Lucide.
// ABOUTME: Рассрочка, установка, доставка — информационные карточки-ссылки.

import type { ServiceCardsBlock as Props } from '@/payload-types'
import * as LucideIcons from 'lucide-react'
import Link from 'next/link'

export const ServiceCardsBlock: React.FC<Props> = ({ cards }) => {
  if (!cards?.length) return null

  return (
    <section className="container py-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => {
          const IconComponent = card.iconName
            ? (LucideIcons as any)[card.iconName] || LucideIcons.Info
            : LucideIcons.Info
          const Wrapper = card.link?.url ? Link : 'div'
          const wrapperProps = card.link?.url ? { href: card.link.url } : {}

          return (
            <Wrapper
              key={card.id || i}
              {...(wrapperProps as any)}
              className="flex items-start gap-4 rounded-2xl bg-secondary/50 p-5 transition-colors hover:bg-secondary"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <IconComponent className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold">{card.title}</h3>
                {card.description && (
                  <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
                )}
              </div>
            </Wrapper>
          )
        })}
      </div>
    </section>
  )
}
```

**Step 3: Register, generate, type check**

**Step 4: Commit**

```
feat: add ServiceCards layout block
```

---

### Task 11: ProductSets block (Готовые решения)

Carousel of curated product sets/bundles.

**Files:**
- Create: `src/blocks/ProductSets/config.ts`
- Create: `src/blocks/ProductSets/Component.tsx`
- Modify: Pages collection and RenderBlocks

**Step 1: Create config**

```typescript
// src/blocks/ProductSets/config.ts
// ABOUTME: Конфигурация блока «Готовые решения» — карусель комплектов товаров.
// ABOUTME: Каждый комплект — карточка с изображением, названием и ценой.

import type { Block } from 'payload'

export const ProductSets: Block = {
  slug: 'productSets',
  labels: { singular: 'Готовые решения', plural: 'Готовые решения' },
  fields: [
    { name: 'title', type: 'text', defaultValue: 'Популярные готовые решения', label: 'Заголовок' },
    {
      name: 'sets',
      type: 'array',
      label: 'Комплекты',
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Название' },
        { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Изображение' },
        { name: 'price', type: 'number', label: 'Цена' },
        { name: 'link', type: 'group', fields: [{ name: 'url', type: 'text', label: 'URL' }] },
      ],
    },
  ],
}
```

**Step 2: Create component** — server component rendering a horizontal scrollable list of set cards.

```typescript
// src/blocks/ProductSets/Component.tsx
// ABOUTME: Горизонтальная карусель «Готовые решения» — комплекты сантехники.
// ABOUTME: Каждый комплект — карточка с фото, названием и ценой.

import type { ProductSetsBlock as Props } from '@/payload-types'
import Link from 'next/link'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'

export const ProductSetsBlock: React.FC<Props> = ({ title, sets }) => {
  if (!sets?.length) return null

  return (
    <section className="container py-8">
      {title && <h2 className="mb-6 font-heading text-xl font-bold">{title}</h2>}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {sets.map((set, i) => {
          const image = set.image && typeof set.image === 'object' ? set.image : undefined
          const Wrapper = set.link?.url ? Link : 'div'
          const wrapperProps = set.link?.url ? { href: set.link.url } : {}

          return (
            <Wrapper
              key={set.id || i}
              {...(wrapperProps as any)}
              className="group w-[280px] shrink-0 overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative aspect-[4/3]">
                {image && (
                  <Media
                    resource={image}
                    imgClassName="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="line-clamp-2 text-sm font-medium">{set.title}</h3>
                {typeof set.price === 'number' && (
                  <p className="mt-1 font-heading text-lg font-bold">
                    <Price amount={set.price} />
                  </p>
                )}
              </div>
            </Wrapper>
          )
        })}
      </div>
    </section>
  )
}
```

**Step 3: Register, generate, type check**

**Step 4: Commit**

```
feat: add ProductSets layout block for curated bundles
```

---

### Task 12: PromoGrid block

Grid of 3 promotion banners (the "Все акции в одном месте" section).

**Files:**
- Create: `src/blocks/PromoGrid/config.ts`
- Create: `src/blocks/PromoGrid/Component.tsx`
- Modify: Pages collection and RenderBlocks

**Step 1: Create config**

```typescript
// src/blocks/PromoGrid/config.ts
// ABOUTME: Конфигурация блока сетки промо-баннеров «Все акции».
// ABOUTME: Отображает 3 промо-карточки из коллекции Promotions (type=sale).

import type { Block } from 'payload'

export const PromoGrid: Block = {
  slug: 'promoGrid',
  labels: { singular: 'Сетка акций', plural: 'Сетки акций' },
  fields: [
    { name: 'title', type: 'text', defaultValue: 'Все акции в одном месте', label: 'Заголовок' },
    {
      name: 'promotions',
      type: 'relationship',
      relationTo: 'promotions',
      hasMany: true,
      maxRows: 4,
      label: 'Промо-акции (пусто = все активные sale)',
    },
  ],
}
```

**Step 2: Create component** — similar to PromoBanners but with title and fetches type=sale.

```typescript
// src/blocks/PromoGrid/Component.tsx
// ABOUTME: Сетка промо-баннеров «Все акции в одном месте».
// ABOUTME: Отображает промо типа «sale» из коллекции Promotions.

import type { Promotion, PromoGridBlock as Props } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { Media } from '@/components/Media'

export const PromoGridBlock: React.FC<Props> = async ({ title, promotions }) => {
  let promos: Promotion[] = []

  if (promotions?.length) {
    promos = promotions
      .map((p) => (typeof p === 'object' ? p : null))
      .filter(Boolean) as Promotion[]
  } else {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'promotions',
      where: { and: [{ active: { equals: true } }, { type: { equals: 'sale' } }] },
      limit: 4,
      depth: 1,
    })
    promos = result.docs
  }

  if (!promos.length) return null

  return (
    <section className="container py-8">
      {title && <h2 className="mb-6 font-heading text-xl font-bold">{title}</h2>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promos.map((promo) => {
          const image = typeof promo.image === 'object' ? promo.image : undefined
          const Wrapper = promo.link?.url ? Link : 'div'
          const wrapperProps = promo.link?.url ? { href: promo.link.url } : {}

          return (
            <Wrapper
              key={promo.id}
              {...(wrapperProps as any)}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl"
            >
              {image && (
                <Media
                  resource={image}
                  imgClassName="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-lg font-bold">{promo.title}</h3>
                {promo.subtitle && <p className="mt-0.5 text-sm opacity-80">{promo.subtitle}</p>}
              </div>
            </Wrapper>
          )
        })}
      </div>
    </section>
  )
}
```

**Step 3: Register, generate, type check**

**Step 4: Commit**

```
feat: add PromoGrid layout block for sale banners
```

---

### Task 13: ImageGallery block (Идеи для дома)

Masonry photo gallery.

**Files:**
- Create: `src/blocks/ImageGallery/config.ts`
- Create: `src/blocks/ImageGallery/Component.tsx`
- Modify: Pages collection and RenderBlocks

**Step 1: Create config**

```typescript
// src/blocks/ImageGallery/config.ts
// ABOUTME: Конфигурация блока masonry-галереи изображений.
// ABOUTME: Используется для секции «Идеи для дома» на главной.

import type { Block } from 'payload'

export const ImageGallery: Block = {
  slug: 'imageGallery',
  labels: { singular: 'Галерея изображений', plural: 'Галереи изображений' },
  fields: [
    { name: 'title', type: 'text', defaultValue: 'Идеи для дома', label: 'Заголовок' },
    {
      name: 'images',
      type: 'array',
      label: 'Изображения',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Изображение' },
        { name: 'caption', type: 'text', label: 'Подпись' },
      ],
    },
  ],
}
```

**Step 2: Create component with CSS columns masonry**

```typescript
// src/blocks/ImageGallery/Component.tsx
// ABOUTME: Masonry-галерея изображений в стиле Pinterest.
// ABOUTME: CSS columns для автоматического распределения по колонкам.

import type { ImageGalleryBlock as Props } from '@/payload-types'
import { Media } from '@/components/Media'

export const ImageGalleryBlock: React.FC<Props> = ({ title, images }) => {
  if (!images?.length) return null

  return (
    <section className="container py-8">
      {title && <h2 className="mb-6 font-heading text-xl font-bold">{title}</h2>}
      <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
        {images.map((item, i) => {
          const image = item.image && typeof item.image === 'object' ? item.image : undefined
          if (!image) return null

          return (
            <div key={item.id || i} className="mb-4 break-inside-avoid overflow-hidden rounded-2xl">
              <Media
                resource={image}
                imgClassName="w-full object-cover"
              />
              {item.caption && (
                <p className="mt-1 text-xs text-muted-foreground">{item.caption}</p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
```

**Step 3: Register, generate, type check**

**Step 4: Commit**

```
feat: add ImageGallery layout block with masonry layout
```

---

## Phase 4: Footer Redesign

### Task 14: Redesign Footer component

**Files:**
- Modify: `src/globals/Footer.ts` — add structured columns
- Modify: `src/components/layout/Footer/index.tsx` — 3 columns + contacts
- Possibly modify: `src/components/layout/Footer/FooterMenu.tsx`

**Step 1: Update Footer global schema** to support column groups:

```typescript
// Add to Footer global fields:
{
  name: 'columns',
  type: 'array',
  maxRows: 4,
  label: 'Колонки',
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Заголовок колонки' },
    {
      name: 'links',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
  ],
},
{
  name: 'contactPhone',
  type: 'text',
  label: 'Телефон',
},
{
  name: 'contactEmail',
  type: 'text',
  label: 'Email',
},
```

Keep existing `navItems` for backward compatibility during transition.

**Step 2: Rewrite Footer component** — 3 column layout with contacts:

```typescript
// Render columns as grid, contacts in a sidebar
<footer>
  <div className="container py-12">
    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
      {columns.map(col => (
        <div key={col.id}>
          <h3 className="mb-4 font-heading text-sm font-bold">{col.title}</h3>
          <ul className="space-y-2">
            {col.links?.map(link => (
              <li><Link href={link.url} className="text-sm text-muted-foreground hover:text-foreground">{link.label}</Link></li>
            ))}
          </ul>
        </div>
      ))}
      {/* Contacts column */}
      <div>
        <h3 className="mb-4 font-heading text-sm font-bold">Контакты</h3>
        {contactPhone && <p className="text-lg font-bold">{contactPhone}</p>}
        {contactEmail && <p className="text-sm text-muted-foreground">{contactEmail}</p>}
      </div>
    </div>
  </div>
  <div className="border-t py-6">
    <div className="container text-center text-xs text-muted-foreground">
      © {year} {siteName}. Все права защищены.
    </div>
  </div>
</footer>
```

**Step 3: Run `pnpm generate:types`, `npx tsc --noEmit`**

**Step 4: Commit**

```
feat: redesign Footer with column layout and contacts
```

---

## Phase 5: Content and Images

### Task 15: Download category images

Use Playwright script (like download-images.mjs) to collect category icon images from santehnika-online.ru. Save to `src/scripts/parser/images/categories/`.

**Step 1: Write Playwright script** to visit santehnika-online.ru homepage, extract category icon images from the horizontal row (section 4 on original), decode CDN URLs to Yandex Cloud direct URLs, download.

**Step 2: Run script**

**Step 3: Update seed script** to upload category images and set `image` field on categories.

**Step 4: Commit**

```
feat: download and seed category images from santehnika-online.ru
```

---

### Task 16: Create seed data for homepage

Update `src/scripts/parser/index.ts` to create:

1. **Promotions** — 3 hero slides, 3 banners, 3 sale promotions (use existing product images with text overlays described in title/subtitle)
2. **FeaturedProducts** — 1 global featured product
3. **Brands** — 9 brands from our products (STWORKI, DIWO, Domaci, EWRIKA, Boheme, Indigo, SantiLine, Jacob Delafon, BOND) with text-based placeholder logos
4. **Home page** in Pages collection with all layout blocks in correct order:
   - categoryIconsRow
   - promoBanners (manual, 3 banners)
   - categoryProductTabs (6 root categories)
   - brandsBlock
   - saleWithCarousel (1 sale promo + products from category)
   - serviceCards (Рассрочка, Установка, Доставка)
   - productSets (3-4 curated sets)
   - promoGrid (3 sale promos)
   - carousel (all products)
   - imageGallery (placeholder — will need stock images)
   - servicesBlock (8 advantages)
5. **Footer global** — 3 columns (О компании, Каталог, Покупателям) + phone + email

**Step 1: Add seed functions for new collections**

**Step 2: Add home page creation with all blocks**

**Step 3: Update footer global data**

**Step 4: Run seed script and verify**

**Step 5: Commit**

```
feat: seed homepage with all blocks, promotions, brands, and footer data
```

---

## Phase 6: Integration and E2E Tests

### Task 17: Write E2E test for homepage

**Files:**
- Modify: `tests/e2e/catalog.e2e.spec.ts` or create `tests/e2e/homepage.e2e.spec.ts`

**Step 1: Write test that verifies homepage loads with all sections**

```typescript
test('homepage renders all sections', async ({ page }) => {
  await page.goto('/')
  // Hero
  await expect(page.locator('[class*="carousel"]').first()).toBeVisible()
  // Category icons
  await expect(page.getByRole('link', { name: /Унитазы/i })).toBeVisible()
  // Brands
  await expect(page.getByText('Только оригинальные бренды')).toBeVisible()
  // Footer columns
  await expect(page.getByText('О компании')).toBeVisible()
  await expect(page.getByText('Каталог')).toBeVisible()
})
```

**Step 2: Run tests**

Run: `pnpm test:e2e`

**Step 3: Commit**

```
test: add E2E test for homepage sections
```

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-3 | New collections: Promotions, FeaturedProducts, Brands |
| 2 | 4 | Hero auto-component (promo slider + featured product) |
| 3 | 5-13 | 9 new layout blocks |
| 4 | 14 | Footer redesign |
| 5 | 15-16 | Content: images + seed data |
| 6 | 17 | E2E tests |

Total: **17 tasks**, estimated **~3-4 hours** of implementation.
