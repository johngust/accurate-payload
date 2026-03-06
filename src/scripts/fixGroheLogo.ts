// ABOUTME: Заменяет текущий логотип бренда Grohe на реальный из public/images/brands/grohe.png.

import configPromise from '@payload-config'
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

async function run() {
  const payload = await getPayload({ config: configPromise })
  const filePath = path.resolve(process.cwd(), 'public/images/brands/grohe.svg')

  if (!fs.existsSync(filePath)) {
    console.error('Файл logo/grohe.svg не найден!')
    process.exit(1)
  }

  const fileBuffer = fs.readFileSync(filePath)

  console.log('Загрузка реального логотипа Grohe (SVG)...')
  try {
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: 'Grohe Logo Real',
      },
      file: {
        data: fileBuffer,
        mimetype: 'image/svg+xml',
        name: `grohe-logo-${Date.now()}.svg`,
        size: fileBuffer.byteLength,
      },
    })

    console.log(`Медиа загружено (id=${media.id})`)

    const brandResult = await payload.find({
      collection: 'brands',
      where: { name: { equals: 'Grohe' } },
      limit: 1,
    })

    if (brandResult.docs.length > 0) {
      await payload.update({
        collection: 'brands',
        id: brandResult.docs[0].id,
        data: {
          logo: media.id,
        },
        context: { disableRevalidate: true },
      })
      console.log(`Бренд Grohe успешно обновлен (ID медиа: ${media.id})`)
    } else {
      console.log('Бренд Grohe не найден в коллекции brands')
    }
  } catch (err) {
    console.error('Ошибка при обновлении логотипа Grohe:', err)
  }

  process.exit(0)
}

run()
