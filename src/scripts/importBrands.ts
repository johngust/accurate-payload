// ABOUTME: Импорт списка брендов из vsedlyavanny.kz в коллекцию Brands.
// ABOUTME: Использует find-or-create паттерн по названию бренда.

import configPromise from '@payload-config'
import 'dotenv/config'
import { getPayload, type Payload } from 'payload'

// ── Data definitions ──────────────────────────────────────────────────────────

const brandsToImport = [
  'Grohe', 'Hansgrohe', 'Roca', 'Jacob Delafon', 'Geberit', 'Laufen', 'Jika',
  'Cersanit', 'Vitra', 'Ideal Standard', 'Ravak', 'Teka', 'Bravat', 'Lemark',
  'Haiba', 'AM.PM', 'Decoroom', 'Rossinka', 'Iddis', 'Sanita', 'Sanita Luxe',
  'Saniteco', 'SSWW', 'Grossman', 'Keramin', 'Santek', 'Oskolskaya Keramika',
  'Santeri', 'BelBagno', 'Creo Ceramique', 'Rosa', 'Kirovit', 'Universal',
  'VIZ', 'Kaldewei', 'Ventospa', 'Alex Baitler', 'Erlit', 'Formina', 'Triton',
  'Kolpa-San', 'Aquanet', 'Briz', 'Vako', 'Aquarodos', 'Alavann', 'Dvin',
  'Laris', 'Terminus'
]

// ── Helpers ───────────────────────────────────────────────────────────────────

async function findOrCreateBrand(
  payload: Payload,
  name: string,
) {
  const existing = await payload.find({
    collection: 'brands',
    where: { name: { equals: name } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    console.log(`  Бренд уже существует: ${name}`)
    return existing.docs[0]
  }

  const created = await payload.create({
    collection: 'brands',
    data: {
      name,
      sortOrder: 0,
    },
    context: { disableRevalidate: true },
  })

  console.log(`  Бренд создан: ${name} (id=${created.id})`)
  return created
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const payload = await getPayload({ config: configPromise })

  console.log('\n=== Импорт брендов ===')

  for (const brandName of brandsToImport) {
    try {
      await findOrCreateBrand(payload, brandName)
    } catch (err) {
      console.error(`  Ошибка при импорте бренда ${brandName}:`, err)
    }
  }

  console.log('\nГотово!')
  process.exit(0)
}

main()
