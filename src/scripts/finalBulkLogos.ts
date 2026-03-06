// ABOUTME: Финальная массовая загрузка логотипов из надежных источников.

import configPromise from '@payload-config'
import 'dotenv/config'
import { getPayload } from 'payload'

const brands = [
  { name: 'Ravak', url: 'https://www.ravak.ru/img/_/logo-ravak-red.png' },
  { name: 'Jika', url: 'https://www.jika.ru/resources/images/logo-jika.png' },
  { name: 'Lemark', url: 'https://lemark.su/wp-content/themes/lemark/img/logo.png' },
  { name: 'Bravat', url: 'https://bravat.su/local/templates/bravat/images/logo.png' },
  { name: 'AM.PM', url: 'https://ampm-world.com/local/templates/ampm/images/logo.png' },
  { name: 'Iddis', url: 'https://iddis.ru/local/templates/main/img/logo.png' },
  { name: 'Keramin', url: 'https://keramin.com/themes/custom/keramin/logo.svg' },
  { name: 'Santek', url: 'https://www.santek.ru/img/logo.svg' },
  { name: 'Rossinka', url: 'https://rossinka-sw.ru/local/templates/rossinka/img/logo.png' },
  { name: 'Sanita Luxe', url: 'https://sanitaluxe.ru/bitrix/templates/sanita/images/logo.png' },
  { name: 'Triton', url: 'https://www.3tn.ru/local/templates/main/img/logo.png' },
  { name: 'Dvin', url: 'https://dvin.net/local/templates/main/images/logo.svg' },
  { name: 'Terminus', url: 'https://terminus.ru/local/templates/terminus/img/logo.svg' }
]

async function run() {
  const payload = await getPayload({ config: configPromise })

  console.log('\n=== Финальная загрузка основных логотипов ===')

  for (const brand of brands) {
    console.log(`\nОбработка: ${brand.name}...`)

    try {
      const brandResult = await payload.find({
        collection: 'brands',
        where: { name: { equals: brand.name } },
        limit: 1,
      })

      if (brandResult.docs.length === 0) {
        console.log(`  Бренд ${brand.name} не найден.`)
        continue
      }

      const dbBrand = brandResult.docs[0]
      if (dbBrand.logo) {
        console.log(`  Логотип уже есть.`)
        continue
      }

      const res = await fetch(brand.url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      if (!res.ok) {
        console.log(`  Ошибка скачивания: ${res.status}`)
        continue
      }
      
      const ab = await res.arrayBuffer()
      const buffer = Buffer.from(ab)
      const ext = brand.url.endsWith('.svg') ? '.svg' : '.png'
      const mime = brand.url.endsWith('.svg') ? 'image/svg+xml' : 'image/png'

      if (buffer.length < 500) {
        console.log(`  Файл слишком мал, возможно ошибка.`)
        continue
      }

      const media = await payload.create({
        collection: 'media',
        data: { alt: `Logo ${brand.name}` },
        file: {
          data: buffer,
          mimetype: mime,
          name: `${brand.name.toLowerCase().replace(/\s+/g, '-')}-logo${ext}`,
          size: buffer.byteLength,
        },
      })

      await payload.update({
        collection: 'brands',
        id: dbBrand.id,
        data: { logo: media.id },
        context: { disableRevalidate: true },
      })

      console.log(`  Успешно! (ID: ${media.id})`)
    } catch (err: any) {
      console.error(`  Ошибка: ${err.message}`)
    }
  }

  console.log('\nГотово!')
  process.exit(0)
}

run()
