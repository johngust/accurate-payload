// ABOUTME: E2E-тесты для главной страницы — проверка наличия основных секций.
// ABOUTME: Верифицирует навигацию, footer, и структурные элементы страницы.

import { expect, test } from '@playwright/test'

const baseURL = 'http://localhost:3000'

test.describe('Главная страница', () => {
  test('загружается без ошибок', async ({ page }) => {
    const response = await page.goto(baseURL)

    expect(response?.status()).toBe(200)
  })

  test('отображает header с кнопкой Каталог', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto(baseURL)

    const catalogButton = page.locator('button', { hasText: 'Каталог' })
    await expect(catalogButton).toBeVisible()
  })

  test('содержит основной контент в article', async ({ page }) => {
    await page.goto(baseURL)

    const article = page.locator('article')
    await expect(article).toBeVisible()
  })

  test('отображает footer с копирайтом', async ({ page }) => {
    await page.goto(baseURL)

    const footer = page.locator('footer')
    await expect(footer).toBeVisible()

    const copyright = footer.getByText('Все права защищены')
    await expect(copyright).toBeVisible()
  })

  test('footer содержит навигационные ссылки', async ({ page }) => {
    await page.goto(baseURL)

    const footer = page.locator('footer')
    // Footer рендерит либо колонки, либо navItems — проверяем, что есть хотя бы одна ссылка
    const footerLinks = footer.locator('a')
    const count = await footerLinks.count()
    expect(count).toBeGreaterThan(0)
  })

  test('содержит хотя бы одну секцию в layout', async ({ page }) => {
    await page.goto(baseURL)

    // Блоки рендерятся внутри article. Каждый блок обёрнут в div.my-16,
    // а Hero — section.container. Проверяем, что есть какой-то контент.
    const article = page.locator('article')
    const sections = article.locator('section, div.my-16')
    const count = await sections.count()
    expect(count).toBeGreaterThan(0)
  })

  test('ссылки из footer ведут на существующие страницы', async ({ page }) => {
    await page.goto(baseURL)

    const footer = page.locator('footer')
    const firstLink = footer.locator('a[href^="/"]').first()
    const href = await firstLink.getAttribute('href')

    expect(href).toBeTruthy()
    // Переходим по ссылке и проверяем, что не 404
    await page.goto(`${baseURL}${href}`)
    const notFound = page.locator('text=Страница не найдена')
    await expect(notFound).not.toBeVisible()
  })
})
