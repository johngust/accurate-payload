// ABOUTME: Интеграционные тесты для глобала Footer.
// ABOUTME: Проверяет новые поля: колонки со ссылками, телефон и email.

import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('Footer', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('saves and retrieves columns with links', async () => {
    const footer = await payload.updateGlobal({
      slug: 'footer',
      data: {
        columns: [
          {
            title: 'Покупателям',
            links: [
              { label: 'Доставка', url: '/delivery' },
              { label: 'Оплата', url: '/payment' },
            ],
          },
          {
            title: 'Компания',
            links: [{ label: 'О нас', url: '/about' }],
          },
        ],
      },
    })

    expect(footer.columns).toBeDefined()
    expect(footer.columns).toHaveLength(2)
    expect(footer.columns![0].title).toBe('Покупателям')
    expect(footer.columns![0].links).toHaveLength(2)
    expect(footer.columns![0].links![0].label).toBe('Доставка')
    expect(footer.columns![0].links![0].url).toBe('/delivery')
    expect(footer.columns![1].title).toBe('Компания')
  })

  it('saves and retrieves contact information', async () => {
    const footer = await payload.updateGlobal({
      slug: 'footer',
      data: {
        contactPhone: '+7 (495) 123-45-67',
        contactEmail: 'info@santehnika-online.ru',
      },
    })

    expect(footer.contactPhone).toBe('+7 (495) 123-45-67')
    expect(footer.contactEmail).toBe('info@santehnika-online.ru')
  })

  it('retrieves footer with all fields populated', async () => {
    await payload.updateGlobal({
      slug: 'footer',
      data: {
        columns: [
          {
            title: 'Информация',
            links: [{ label: 'Контакты', url: '/contacts' }],
          },
        ],
        contactPhone: '+7 (800) 555-35-35',
        contactEmail: 'test@example.com',
      },
    })

    const footer = await payload.findGlobal({ slug: 'footer' })

    expect(footer.columns).toHaveLength(1)
    expect(footer.columns![0].title).toBe('Информация')
    expect(footer.contactPhone).toBe('+7 (800) 555-35-35')
    expect(footer.contactEmail).toBe('test@example.com')
  })
})
