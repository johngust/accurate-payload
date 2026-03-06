// ABOUTME: Загружает логотипы брендов из public/images/brands и привязывает их к коллекции Brands.
// ABOUTME: Сопоставление идет по имени файла (без расширения) и названию бренда.

import configPromise from '@payload-config'
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { getPayload, type Payload } from 'payload'

const brandMapping: Record<string, string> = {
  'grohe': 'Grohe',
  'hansgrohe': 'Hansgrohe',
  'roca': 'Roca',
  'jacob-delafon': 'Jacob Delafon',
  'geberit': 'Geberit',
  'laufen': 'Laufen',
  'jika': 'Jika',
  'cersanit': 'Cersanit',
  'vitra': 'Vitra',
  'ideal-standard': 'Ideal Standard'
}

async function uploadAndLinkLogos() {
  const payload = await getPayload({ config: configPromise })
  const brandsDir = path.resolve(process.cwd(), 'public/images/brands')

  if (!fs.existsSync(brandsDir)) {
    console.error('Директория с логотипами не найдена!')
    process.exit(1)
  }

  const files = fs.readdirSync(brandsDir)

  console.log('\n=== Загрузка и привязка логотипов ===')

  for (const file of files) {
    const filePath = path.join(brandsDir, file)
    const fileExt = path.extname(file).toLowerCase()
    const fileName = path.parse(file).name.toLowerCase()

    if (['.png', '.jpg', '.jpeg', '.svg'].includes(fileExt)) {
      const brandName = brandMapping[fileName]
      if (!brandName) {
        console.log(`  Пропускаю файл ${file} (нет маппинга на бренд)`)
        continue
      }

      console.log(`\nОбработка: ${brandName} (${file})`)

      try {
        // 1. Ищем бренд
        const brandResult = await payload.find({
          collection: 'brands',
          where: { name: { equals: brandName } },
          limit: 1,
        })

        if (brandResult.docs.length === 0) {
          console.log(`  Бренд ${brandName} не найден в базе данных.`)
          continue
        }

        const brand = brandResult.docs[0]

        // 2. Загружаем медиа
        const fileBuffer = fs.readFileSync(filePath)
        const media = await payload.create({
          collection: 'media',
          data: {
            alt: `Logo - ${brandName}`,
          },
          file: {
            data: fileBuffer,
            mimetype: fileExt === '.svg' ? 'image/svg+xml' : 'image/png',
            name: file,
            size: fileBuffer.byteLength,
          },
        })

        console.log(`  Медиа загружено (id=${media.id})`)

        // 3. Обновляем бренд
        await payload.update({
          collection: 'brands',
          id: brand.id,
          data: {
            logo: media.id,
          },
          context: { disableRevalidate: true },
        })

        console.log(`  Бренд ${brandName} обновлен!`)
      } catch (err) {
        console.error(`  Ошибка при обработке ${brandName}:`, err)
      }
    }
  }

  console.log('\nГотово!')
  process.exit(0)
}

uploadAndLinkLogos()
