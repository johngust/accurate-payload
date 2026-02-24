// ABOUTME: Скрипт скачивания изображений товаров с santehnika-online.ru.
// ABOUTME: Собирает CDN URLs через Playwright, декодирует в прямые Yandex Cloud ссылки, скачивает локально.

import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import https from 'https'
import path from 'path'

const CATEGORIES = [
  { slug: 'unitazy', path: '/unitazy/' },
  { slug: 'rakoviny', path: '/rakoviny/' },
  { slug: 'vanny', path: '/vanny/' },
  { slug: 'smesiteli', path: '/smesiteli/' },
  { slug: 'polotencesushiteli', path: '/polotencesushiteli/' },
  { slug: 'bide', path: '/bide/' },
]

// Our product slugs to match against category page product links
const PRODUCT_SLUGS = [
  'stworki-molde-s23401wh',
  'stworki-gotland-s13401wh',
  'stworki-olland-s01400wh',
  'stworki-gotland-s13400wh',
  'stworki-vestfoll-s08400wh',
  'stworki-kronborg-s28401bk',
  'diwo-sochi-0402',
  'stworki-molde-s23410wh',
  'stworki-avila-60x50',
  'diwo-murmansk-a61',
  'diwo-murmansk-a71',
  'stworki-bergen-s21413wh',
  'stworki-olborg-s20410wh',
  'diwo-murmansk-a81',
  'diwo-pereslavl-160x70',
  'diwo-anapa-150x70',
  'diwo-kostroma-160x70',
  'diwo-kostroma-170x70',
  'diwo-anapa-170x70',
  'diwo-kostroma-180x70',
  'diwo-kazan-150x70',
  'stworki-lerum-s04170cr',
  'stworki-gotland-s13170cr',
  'domaci-ravenna-d17000cr',
  'stworki-kirkenes-s45010s',
  'stworki-estersund-s31010bk',
  'diwo-oryol-dw-orl75cr',
  'stworki-kirkenes-s45115s',
  'indigo-line-llshw80-50gdpk3',
  'ewrika-safo-d-65x55',
  'ewrika-kassandra-pd-85x55',
  'boheme-uno-726-mg',
  'santiline-sl-5058',
  'jacob-delafon-rodin-ebj0002',
  'bond-oval-f01-20',
]

const OUTPUT_DIR = path.resolve('src/scripts/parser/images')

function decodeCdnUrl(cdnUrl) {
  // CDN URL format: https://static.santehnika-online.ru/static/{hash}/rs:fit:388:388:0/g:no/{base64}.jpg
  const match = cdnUrl.match(/\/g:no\/([A-Za-z0-9+/=_-]+)\.\w+$/)
  if (!match) return null
  // base64url → standard base64
  let b64 = match[1].replace(/-/g, '+').replace(/_/g, '/')
  // Add padding
  while (b64.length % 4 !== 0) b64 += '='
  try {
    return Buffer.from(b64, 'base64').toString('utf-8')
  } catch {
    return null
  }
}

function slugFromHref(href) {
  // href like /product/unitaz_podvesnoy_stworki_molde_s23401wh_bezobodkovyy.../685606/
  const hrefLower = href.toLowerCase()
  for (const slug of PRODUCT_SLUGS) {
    // Convert slug hyphens to underscores for matching
    const slugUnderscore = slug.replace(/-/g, '_')
    if (hrefLower.includes(slugUnderscore)) {
      return slug
    }
  }
  return null
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = path.resolve(dest)
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadFile(response.headers.location, dest).then(resolve).catch(reject)
        return
      }
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode} for ${url}`))
        return
      }
      const chunks = []
      response.on('data', (chunk) => chunks.push(chunk))
      response.on('end', () => {
        writeFileSync(file, Buffer.concat(chunks))
        resolve()
      })
      response.on('error', reject)
    }).on('error', reject)
  })
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled'],
  })
  const ctx = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  })
  const page = await ctx.newPage()

  const imageMap = new Map() // slug → directUrl

  for (const cat of CATEGORIES) {
    console.log(`\n=== Категория: ${cat.slug} ===`)
    await page.goto(`https://santehnika-online.ru${cat.path}`, {
      timeout: 30000,
      waitUntil: 'domcontentloaded',
    })
    await page.waitForTimeout(3000)

    // Scroll down to load lazy-loaded products
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => window.scrollBy(0, 1000))
      await page.waitForTimeout(500)
    }
    await page.waitForTimeout(1000)

    const products = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/product/"]'))
      const seen = new Set()
      const results = []
      for (const a of links) {
        const href = a.getAttribute('href')
        if (!href || seen.has(href) || href.includes('komplekt')) continue
        seen.add(href)
        const img = a.querySelector('img')
        const imgSrc = img ? img.getAttribute('data-src') || img.getAttribute('src') || '' : ''
        if (imgSrc) {
          results.push({ href, imgSrc })
        }
      }
      return results
    })

    console.log(`  Найдено ${products.length} товаров на странице`)

    for (const prod of products) {
      const slug = slugFromHref(prod.href)
      if (!slug) continue
      if (imageMap.has(slug)) continue

      const directUrl = decodeCdnUrl(prod.imgSrc)
      if (directUrl) {
        imageMap.set(slug, directUrl)
        console.log(`  ✓ ${slug} → ${directUrl.split('/').pop()}`)
      }
    }
  }

  await browser.close()

  console.log(`\n=== Скачивание ${imageMap.size} изображений ===`)

  const result = {}
  for (const [slug, url] of imageMap) {
    const ext = url.endsWith('.png') ? 'png' : 'jpg'
    const filename = `${slug}.${ext}`
    const filepath = path.join(OUTPUT_DIR, filename)

    if (existsSync(filepath)) {
      console.log(`  [есть] ${filename}`)
      result[slug] = filename
      continue
    }

    try {
      await downloadFile(url, filepath)
      console.log(`  [скачан] ${filename}`)
      result[slug] = filename
    } catch (err) {
      console.error(`  [ошибка] ${filename}: ${err.message}`)
    }
  }

  // Output mapping
  const mappingPath = path.join(OUTPUT_DIR, 'mapping.json')
  writeFileSync(mappingPath, JSON.stringify(result, null, 2))
  console.log(`\nMapping записан: ${mappingPath}`)
  console.log(`Скачано: ${Object.keys(result).length}/${PRODUCT_SLUGS.length}`)

  const missing = PRODUCT_SLUGS.filter((s) => !result[s])
  if (missing.length > 0) {
    console.log(`\nНе найдены изображения для:`)
    missing.forEach((s) => console.log(`  - ${s}`))
  }
}

main().catch((err) => {
  console.error('Ошибка:', err)
  process.exit(1)
})
