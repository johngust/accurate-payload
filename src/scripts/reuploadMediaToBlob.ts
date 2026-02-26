// ABOUTME: Скрипт перезагрузки медиафайлов из локального хранилища в Vercel Blob.
// ABOUTME: Обновляет существующие записи media через Payload Local API.

import configPromise from '@payload-config'
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  const mimeMap: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  }
  return mimeMap[ext] || 'application/octet-stream'
}

async function reuploadMedia() {
  const payload = await getPayload({ config: configPromise })
  const mediaDir = path.resolve(process.cwd(), 'media')

  if (!fs.existsSync(mediaDir)) {
    console.error('Директория media/ не найдена')
    process.exit(1)
  }

  // Получаем все записи media из базы
  const allMedia = await payload.find({
    collection: 'media',
    limit: 200,
    depth: 0,
  })

  console.log(`Найдено ${allMedia.docs.length} записей media в базе`)

  let success = 0
  let skipped = 0
  let failed = 0

  for (const doc of allMedia.docs) {
    const filename = doc.filename
    if (!filename) {
      console.log(`[SKIP] ID ${doc.id} — нет filename`)
      skipped++
      continue
    }

    // Если URL уже указывает на Blob, пропускаем
    if (doc.url && doc.url.startsWith('http')) {
      console.log(`[SKIP] ID ${doc.id} (${filename}) — уже в Blob`)
      skipped++
      continue
    }

    const filePath = path.join(mediaDir, filename)
    if (!fs.existsSync(filePath)) {
      console.log(`[MISS] ID ${doc.id} (${filename}) — файл не найден на диске`)
      failed++
      continue
    }

    try {
      const data = fs.readFileSync(filePath)
      const mimeType = getMimeType(filename)

      await payload.update({
        collection: 'media',
        id: doc.id,
        data: {
          alt: doc.alt || filename,
        },
        file: {
          data,
          mimetype: mimeType,
          name: filename,
          size: data.byteLength,
        },
      })

      console.log(`[OK] ID ${doc.id} (${filename}) — загружено в Blob`)
      success++
    } catch (err) {
      console.error(`[ERR] ID ${doc.id} (${filename}):`, err)
      failed++
    }
  }

  console.log(`\nИтого: ${success} загружено, ${skipped} пропущено, ${failed} ошибок`)
  process.exit(0)
}

reuploadMedia()
