---
name: payload-data-import
description: "When the user wants to create, update, import, seed, or restore data in Payload CMS collections. Also use when the user mentions 'seed data,' 'import products,' 'restore page,' 'create promotions,' 'update home page layout,' 'populate collections,' or 'add content to CMS.' This skill ensures data is written safely through Payload Local API without accidental deletion."
---

# Payload Data Import

You are an expert at writing and running data import scripts for Payload CMS. Your goal is to safely create or update data through the Payload Local API without ever deleting existing records.

## Core Safety Rules

**These rules are non-negotiable. Breaking them can destroy production data.**

1. **NEVER delete documents.** Do not use `payload.delete()` unless the user explicitly requests deletion of a specific record by ID/name.
2. **NEVER recreate documents.** Do not delete-then-create. Always use `payload.update()` to modify existing records.
3. **Always use find-or-create pattern.** Before creating a record, check if it already exists by a unique field (slug, title, sku). If it exists, skip or update.
4. **NEVER use `seedClone.ts`.** This script deletes the home page before recreating it. It must not be run against a database with real data.
5. **Always pass `context: { disableRevalidate: true }`.** Scripts run outside Next.js context — `revalidatePath` will throw without this flag.
6. **Always delete the `dev` migration record after running.** Any script that calls `getPayload()` creates a `dev` row in `payload_migrations` that will hang production builds.

## Script Template

Every data import script MUST follow this structure:

```typescript
// ABOUTME: <What this script does — one line>.
// ABOUTME: <How it does it — one line>.

import configPromise from '@payload-config'
import 'dotenv/config'
import { getPayload, type Payload } from 'payload'

// ── Data definitions ──────────────────────────────────────────────────────────

const dataToImport = [
  // Define data here, NOT inline in the import function
]

// ── Helpers ───────────────────────────────────────────────────────────────────

async function findOrCreate(
  payload: Payload,
  collection: string,
  uniqueField: string,
  uniqueValue: string,
  data: Record<string, any>,
) {
  const existing = await payload.find({
    collection,
    where: { [uniqueField]: { equals: uniqueValue } },
    limit: 1,
  })
  if (existing.docs.length > 0) {
    console.log(`  Уже существует: ${uniqueValue}`)
    return existing.docs[0]
  }

  const created = await payload.create({ collection, data })
  console.log(`  Создано: ${uniqueValue} (id=${created.id})`)
  return created
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const payload = await getPayload({ config: configPromise })

  console.log('\n=== Importing data ===')

  for (const item of dataToImport) {
    await findOrCreate(payload, 'collectionSlug', 'title', item.title, item)
  }

  console.log('\nГотово!')
  process.exit(0)
}

main()
```

## Checklist Before Running

1. **Verify target IDs.** If the script references IDs (media, categories, products), verify them against the database first:
   ```sql
   SELECT id, title FROM categories WHERE parent_id IS NULL ORDER BY id;
   SELECT id, filename FROM media ORDER BY id;
   ```

2. **Check for existing records.** Ensure the find-or-create logic uses the right unique field.

3. **Run the script:**
   ```bash
   npx tsx src/scripts/<scriptName>.ts
   ```

4. **Delete dev migration record immediately after:**
   ```sql
   DELETE FROM payload_migrations WHERE name = 'dev';
   ```

## Collection-Specific Patterns

### Promotions

```typescript
await findOrCreate(payload, 'promotions', 'title', promo.title, {
  title: promo.title,
  subtitle: promo.subtitle,
  type: promo.type, // 'hero' | 'banner' | 'sale'
  active: true,
  image: promo.mediaId, // numeric media ID
  link: { url: promo.url, label: promo.label },
})
```

### FeaturedProducts

```typescript
await findOrCreate(payload, 'featuredProducts', 'product', productId, {
  title: 'Товар дня',
  product: productId, // numeric product ID
  discountPercent: 20,
  active: true,
})
```

### Pages (layout update)

**NEVER delete a page. ALWAYS update.**

```typescript
const pages = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'home' } },
  limit: 1,
})

if (pages.docs.length === 0) {
  console.error('Страница не найдена!')
  process.exit(1)
}

await payload.update({
  collection: 'pages',
  id: pages.docs[0].id,
  context: { disableRevalidate: true },
  data: {
    layout: [
      // blocks here
    ],
  },
})
```

### Products

```typescript
await findOrCreate(payload, 'products', 'sku', product.sku, {
  title: product.title,
  slug: product.slug,
  _status: 'published',
  priceInKZT: product.price,
  inStock: 'in_stock',
  sku: product.sku,
  categories: [product.categoryId],
})
```

## Updating Existing Records

When you need to update an existing record (not create), use this pattern:

```typescript
async function updateIfExists(
  payload: Payload,
  collection: string,
  uniqueField: string,
  uniqueValue: string,
  data: Record<string, any>,
) {
  const existing = await payload.find({
    collection,
    where: { [uniqueField]: { equals: uniqueValue } },
    limit: 1,
  })
  if (existing.docs.length === 0) {
    console.log(`  Не найдено: ${uniqueValue} — пропускаю`)
    return null
  }

  const updated = await payload.update({
    collection,
    id: existing.docs[0].id,
    data,
  })
  console.log(`  Обновлено: ${uniqueValue} (id=${updated.id})`)
  return updated
}
```

## Home Page Layout Reference

The approved home page layout (from `docs/plans/2026-02-25-homepage-implementation.md`) has 11 blocks in this order:

1. `categoryIconsRow` — auto-fetches root categories
2. `promoBanners` — source: manual, links to Promotions (type=banner)
3. `categoryProductTabs` — categories: [8,13,18,23,32,47], limit: 4
4. `brandsBlock` — auto-fetches from Brands collection
5. `saleWithCarousel` — promotion: (sale promo ID), populateBy: collection
6. `serviceCards` — 3 static cards (Рассрочка, Установка, Доставка)
7. `productSets` — populated via admin panel
8. `promoGrid` — links to Promotions (type=sale)
9. `carousel` — populateBy: collection, limit: 10
10. `imageGallery` — populated via admin panel
11. `servicesBlock` — 8 static advantages

## Lucide Icon Names

Components use PascalCase for Lucide icons (imported as `* as LucideIcons from 'lucide-react'`):
- `Truck`, `Wrench`, `ShieldCheck`, `CreditCard`, `Banknote`
- `RotateCcw`, `Headphones`, `BadgeCheck`, `Percent`, `Info`

## What NOT to Do

- Do NOT run `seedClone.ts` — it deletes the home page
- Do NOT use `payload.delete()` without explicit user permission
- Do NOT hardcode IDs without verifying them against the database first
- Do NOT forget to delete the `dev` migration record after running scripts
- Do NOT create scripts that mix deletion and creation (delete-then-create antipattern)
