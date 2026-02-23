// ABOUTME: Интеграционные тесты для коллекции Categories.
// ABOUTME: Проверяет поля, создание и связи категорий.

import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
const createdIds: { categories: number[]; media: number[] } = { categories: [], media: [] }

describe('Categories', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterAll(async () => {
    for (const id of createdIds.categories) {
      await payload.delete({ collection: 'categories', id }).catch(() => {})
    }
    for (const id of createdIds.media) {
      await payload.delete({ collection: 'media', id }).catch(() => {})
    }
  })

  it('creates a category with an image', async () => {
    // Создаём медиа-документ через Local API
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: 'Test category image',
      },
      file: {
        data: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          'base64',
        ),
        mimetype: 'image/png',
        name: 'test-category-image.png',
        size: 68,
      },
    })
    createdIds.media.push(media.id)

    const category = await payload.create({
      collection: 'categories',
      data: {
        title: 'Тестовая категория с изображением',
        slug: 'test-category-with-image',
        image: media.id,
      },
    })
    createdIds.categories.push(category.id)

    expect(category.image).toBeDefined()

    // Проверяем что при чтении image подтягивается
    const fetched = await payload.findByID({
      collection: 'categories',
      id: category.id,
      depth: 1,
    })

    expect(fetched.image).toBeDefined()
    expect(typeof fetched.image).toBe('object')
    if (typeof fetched.image === 'object' && fetched.image !== null) {
      expect(fetched.image.id).toBe(media.id)
    }
  })
})
