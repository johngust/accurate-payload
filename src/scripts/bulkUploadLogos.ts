// ABOUTME: Автоматизированная загрузка логотипов для списка брендов.
// ABOUTME: Содержит маппинг брендов на прямые ссылки к их логотипам.

import configPromise from '@payload-config'
import 'dotenv/config'
import { getPayload } from 'payload'

const brandLogos = [
  { name: 'Grohe', domain: 'grohe.com' },
  { name: 'Hansgrohe', domain: 'hansgrohe.com' },
  { name: 'Roca', domain: 'roca.com' },
  { name: 'Jacob Delafon', domain: 'jacobdelafon.com' },
  { name: 'Geberit', domain: 'geberit.com' },
  { name: 'Laufen', domain: 'laufen.com' },
  { name: 'Jika', domain: 'jika.eu' },
  { name: 'Cersanit', domain: 'cersanit.ru' },
  { name: 'Vitra', domain: 'vitra.com' },
  { name: 'Ideal Standard', domain: 'idealstandard.com' },
  { name: 'Ravak', domain: 'ravak.com' },
  { name: 'Teka', domain: 'teka.com' },
  { name: 'Bravat', domain: 'bravat.com' },
  { name: 'Lemark', domain: 'lemark.su' },
  { name: 'AM.PM', domain: 'ampm-world.com' },
  { name: 'Iddis', domain: 'iddis.ru' },
  { name: 'Sanita', domain: 'sanita.ru' },
  { name: 'Sanita Luxe', domain: 'sanitaluxe.ru' },
  { name: 'Keramin', domain: 'keramin.com' },
  { name: 'Santek', domain: 'santek.ru' },
  { name: 'Kaldewei', domain: 'kaldewei.com' },
  { name: 'Triton', domain: '3tn.ru' },
  { name: 'Aquanet', domain: 'aquanet.ru' },
  { name: 'Vako', domain: 'vako-mebel.ru' },
  { name: 'Aquarodos', domain: 'aquarodos.ua' },
  { name: 'Alavann', domain: 'alavann.ru' },
  { name: 'Dvin', domain: 'dvin.net' },
  { name: 'Terminus', domain: 'terminus.ru' },
  { name: 'Laris', domain: 'laris.ua' },
  { name: 'BelBagno', domain: 'belbagno.it' },
  { name: 'Creo Ceramique', domain: 'creoceramique.fr' },
  { name: 'Grossman', domain: 'grossman.su' },
  { name: 'SSWW', domain: 'ssww.com.cn' },
  { name: 'Erlit', domain: 'erlit.ru' }
].map(b => ({
  ...b,
  url: `https://logo.clearbit.com/${b.domain}?size=256`,
  type: 'image/png',
  ext: '.png'
}))

async function run() {
  const payload = await getPayload({ config: configPromise })

  console.log('\n=== Массовая загрузка логотипов через Clearbit ===')

  for (const item of brandLogos) {
    console.log(`\nОбработка: ${item.name} (${item.domain})...`)

    try {
      const brandResult = await payload.find({
        collection: 'brands',
        where: { name: { equals: item.name } },
        limit: 1,
      })

      if (brandResult.docs.length === 0) {
        console.log(`  Бренд ${item.name} не найден в базе.`)
        continue
      }

      const brand = brandResult.docs[0]
      if (brand.logo) {
        console.log(`  У бренда ${item.name} уже есть логотип.`)
        // Если это Grohe, мы его уже обновили, но скрипт может идти дальше
        continue
      }

      const response = await fetch(item.url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      if (!response.ok) {
        console.log(`  Логотип не найден через Clearbit для ${item.domain}. Пробую альтернативный источник...`)
        continue
      }
      
      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      if (buffer.toString('utf8', 0, 5) === '<!DOC') {
        console.log(`  URL вернул HTML для ${item.name}. Пропускаю.`)
        continue
      }

      const media = await payload.create({
        collection: 'media',
        data: {
          alt: `Logo ${item.name}`,
        },
        file: {
          data: buffer,
          mimetype: 'image/png',
          name: `${item.name.toLowerCase().replace(/\s+/g, '-')}-logo.png`,
          size: buffer.byteLength,
        },
      })

      console.log(`  Медиа загружено (id=${media.id})`)

      await payload.update({
        collection: 'brands',
        id: brand.id,
        data: {
          logo: media.id,
        },
        context: { disableRevalidate: true },
      })

      console.log(`  Бренд ${item.name} успешно обновлен!`)
    } catch (err: any) {
      console.error(`  Ошибка при обработке ${item.name}: ${err.message}`)
    }
  }

  console.log('\nГотово!')
  process.exit(0)
}

run()
