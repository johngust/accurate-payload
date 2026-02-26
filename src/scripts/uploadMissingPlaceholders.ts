// ABOUTME: Генерирует и загружает недостающие placeholder-изображения для промо и категорий.
// ABOUTME: Обновляет существующие media-записи через Payload Local API с Vercel Blob.

import configPromise from '@payload-config'
import 'dotenv/config'
import { getPayload } from 'payload'
import sharp from 'sharp'

type PlaceholderSpec = {
  id: number
  filename: string
  width: number
  height: number
  bgColor: string
  text: string
}

const missing: PlaceholderSpec[] = [
  // Промо-баннеры 800x400
  { id: 54, filename: 'promo_1.png', width: 800, height: 400, bgColor: '#2563eb', text: 'Promo 1' },
  { id: 55, filename: 'promo_2.png', width: 800, height: 400, bgColor: '#059669', text: 'Promo 2' },
  { id: 56, filename: 'promo_3.png', width: 800, height: 400, bgColor: '#d97706', text: 'Promo 3' },
  // Категории 120x120
  { id: 48, filename: 'cat_2.png', width: 120, height: 120, bgColor: '#6366f1', text: 'Cat' },
  { id: 49, filename: 'cat_1.png', width: 120, height: 120, bgColor: '#ec4899', text: 'Cat' },
  { id: 50, filename: 'cat_3.png', width: 120, height: 120, bgColor: '#14b8a6', text: 'Cat' },
  { id: 51, filename: 'cat_4.png', width: 120, height: 120, bgColor: '#f97316', text: 'Cat' },
]

async function generatePlaceholder(spec: PlaceholderSpec): Promise<Buffer> {
  const svg = `<svg width="${spec.width}" height="${spec.height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${spec.bgColor}"/>
    <text x="50%" y="50%" text-anchor="middle" dy=".35em" fill="white" font-size="${Math.floor(spec.height / 4)}" font-family="sans-serif">${spec.text}</text>
  </svg>`

  return sharp(Buffer.from(svg)).png().toBuffer()
}

async function main() {
  const payload = await getPayload({ config: configPromise })

  for (const spec of missing) {
    try {
      const data = await generatePlaceholder(spec)

      await payload.update({
        collection: 'media',
        id: spec.id,
        data: {},
        file: {
          data,
          mimetype: 'image/png',
          name: spec.filename,
          size: data.byteLength,
        },
      })

      console.log(`[OK] ID ${spec.id} (${spec.filename}) — загружено`)
    } catch (err) {
      console.error(`[ERR] ID ${spec.id} (${spec.filename}):`, err)
    }
  }

  console.log('Готово!')
  process.exit(0)
}

main()
