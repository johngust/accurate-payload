// ABOUTME: Переносит медиафайлы из одного Vercel Blob Store в другой.
// ABOUTME: Скачивает файлы из старого store по URL и перезаливает через Payload в новый.

import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const OLD_TOKEN = process.env.BLOB_READ_WRITE_TOKEN

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

async function listOldBlobs(): Promise<Array<{ url: string; pathname: string }>> {
  const blobs: Array<{ url: string; pathname: string }> = []
  let cursor: string | undefined

  do {
    const params = new URLSearchParams({ limit: '100' })
    if (cursor) params.set('cursor', cursor)

    const res = await fetch(`https://blob.vercel-storage.com?${params}`, {
      headers: { authorization: `Bearer ${OLD_TOKEN}` },
    })

    if (!res.ok) {
      throw new Error(`Blob list failed: ${res.status} ${await res.text()}`)
    }

    const data = await res.json()
    blobs.push(...data.blobs)
    cursor = data.hasMore ? data.cursor : undefined
  } while (cursor)

  return blobs
}

async function migrate() {
  if (!OLD_TOKEN) {
    console.error('BLOB_READ_WRITE_TOKEN (старый токен) не найден в .env')
    process.exit(1)
  }

  // 1. Скачиваем файлы из старого store
  const tempDir = path.resolve(process.cwd(), 'media')
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }

  console.log('=== Получаем список файлов из старого Blob Store ===')
  const blobs = await listOldBlobs()
  console.log(`Найдено ${blobs.length} файлов в старом store\n`)

  console.log('=== Скачиваем файлы ===')
  for (const blob of blobs) {
    const filename = blob.pathname.split('/').pop() || blob.pathname
    const filePath = path.join(tempDir, filename)

    if (fs.existsSync(filePath)) {
      console.log(`[SKIP] ${filename} — уже скачан`)
      continue
    }

    try {
      const response = await fetch(blob.url)
      const buffer = Buffer.from(await response.arrayBuffer())
      fs.writeFileSync(filePath, buffer)
      console.log(`[OK] ${filename} (${(buffer.byteLength / 1024).toFixed(1)} KB)`)
    } catch (err) {
      console.error(`[ERR] ${filename}:`, err)
    }
  }

  // 2. Перезаливаем через Payload (используя новый токен)
  console.log('\n=== Заливаем файлы в новый Blob Store через Payload ===')

  const payload = await getPayload({ config: configPromise })

  const allMedia = await payload.find({
    collection: 'media',
    limit: 200,
    depth: 0,
  })

  console.log(`Записей media в базе: ${allMedia.docs.length}`)

  let success = 0
  let skipped = 0
  let failed = 0

  for (const doc of allMedia.docs) {
    const filename = doc.filename
    if (!filename) {
      skipped++
      continue
    }

    const filePath = path.join(tempDir, filename)
    if (!fs.existsSync(filePath)) {
      console.log(`[MISS] ID ${doc.id} (${filename}) — файл не найден`)
      failed++
      continue
    }

    try {
      const data = fs.readFileSync(filePath)
      const mimeType = getMimeType(filename)

      await payload.update({
        collection: 'media',
        id: doc.id,
        data: { alt: doc.alt || filename },
        file: {
          data,
          mimetype: mimeType,
          name: filename,
          size: data.byteLength,
        },
      })

      console.log(`[OK] ID ${doc.id} (${filename}) — загружено`)
      success++
    } catch (err) {
      console.error(`[ERR] ID ${doc.id} (${filename}):`, err)
      failed++
    }
  }

  console.log(`\nИтого: ${success} загружено, ${skipped} пропущено, ${failed} ошибок`)
  process.exit(0)
}

migrate()
