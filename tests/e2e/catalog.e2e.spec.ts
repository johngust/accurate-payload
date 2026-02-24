// ABOUTME: E2E тесты для каталога, фильтров, мега-меню и статических страниц.
// ABOUTME: Проверяет навигацию, русскоязычные тексты и работу фильтров.

import { expect, test } from '@playwright/test'

const baseURL = 'http://localhost:3000'

test.describe('Каталог', () => {
  test('отображает корневые категории на /catalog', async ({ page }) => {
    await page.goto(`${baseURL}/catalog`)

    const heading = page.locator('h1')
    await expect(heading).toHaveText('Каталог')

    // Проверяем что есть хотя бы несколько категорий
    const categoryLinks = page.locator('a[href^="/catalog/"]')
    const count = await categoryLinks.count()
    expect(count).toBeGreaterThanOrEqual(5)
  })

  test('переход из /catalog в категорию показывает товары', async ({ page }) => {
    await page.goto(`${baseURL}/catalog`)

    // Кликаем на первую категорию
    const firstCategory = page.locator('a[href^="/catalog/"]').first()
    const categoryName = await firstCategory.textContent()
    await firstCategory.click()

    // Проверяем что мы на странице категории
    await expect(page).toHaveURL(/\/catalog\//)

    // Заголовок соответствует названию категории
    const heading = page.locator('h1')
    await expect(heading).toContainText(categoryName?.trim() || '')
  })

  test('категория с товарами отображает карточки', async ({ page }) => {
    await page.goto(`${baseURL}/catalog/unitazy`)

    const heading = page.locator('h1')
    await expect(heading).toHaveText('Унитазы')

    // Должны быть товары или подкатегории
    const productCards = page.locator('a[href^="/products/"]')
    const subcategoryCards = page.locator('a[href^="/catalog/"]')
    const totalItems = (await productCards.count()) + (await subcategoryCards.count())
    expect(totalItems).toBeGreaterThan(0)
  })

  test('/shop перенаправляет на /catalog', async ({ page }) => {
    await page.goto(`${baseURL}/shop`)
    await expect(page).toHaveURL(`${baseURL}/catalog`)
  })

  test('хлебные крошки работают', async ({ page }) => {
    await page.goto(`${baseURL}/catalog/unitazy`)

    const breadcrumbLink = page.locator('nav a[href="/catalog"]')
    await expect(breadcrumbLink).toHaveText('Каталог')
  })
})

test.describe('Фильтры', () => {
  test('фильтр наличия обновляет URL', async ({ page }) => {
    await page.goto(`${baseURL}/catalog/unitazy`)

    // Кликаем на чекбокс "В наличии"
    const inStockCheckbox = page.locator('label', { hasText: 'В наличии' }).locator('input')
    await inStockCheckbox.click()

    await expect(page).toHaveURL(/inStock=in_stock/)
  })

  test('фильтр цены применяется по кнопке', async ({ page }) => {
    await page.goto(`${baseURL}/catalog/unitazy`)

    const minInput = page.locator('input[placeholder="от"]')
    const maxInput = page.locator('input[placeholder="до"]')
    await minInput.fill('10000')
    await maxInput.fill('30000')

    const applyButton = page.locator('button', { hasText: 'Применить' })
    await applyButton.click()

    await expect(page).toHaveURL(/minPrice=10000/)
    await expect(page).toHaveURL(/maxPrice=30000/)
  })

  test('кнопка сброса очищает фильтры', async ({ page }) => {
    await page.goto(`${baseURL}/catalog/unitazy?inStock=in_stock&minPrice=5000`)

    const resetButton = page.locator('button', { hasText: 'Сбросить фильтры' })
    await expect(resetButton).toBeVisible()
    await resetButton.click()

    await expect(page).toHaveURL(`${baseURL}/catalog/unitazy`)
  })
})

test.describe('Мега-меню', () => {
  test('кнопка "Каталог" отображается в Header на десктопе', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto(baseURL)

    const catalogButton = page.locator('button', { hasText: 'Каталог' })
    await expect(catalogButton).toBeVisible()
  })

  test('клик на "Каталог" открывает мега-меню с категориями', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto(baseURL)

    const catalogButton = page.locator('button', { hasText: 'Каталог' })
    await catalogButton.click()

    // Должно появиться меню с категориями
    const menuPanel = page.locator('a[href="/catalog/unitazy"]')
    await expect(menuPanel).toBeVisible()
  })

  test('наведение на категорию показывает подкатегории', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto(baseURL)

    const catalogButton = page.locator('button', { hasText: 'Каталог' })
    await catalogButton.click()

    // Наводим на "Раковины"
    const rakovinyLink = page.locator('a[href="/catalog/rakoviny"]').first()
    await rakovinyLink.hover()

    // Должны появиться подкатегории
    const subcategory = page.locator('a[href="/catalog/nakladnye-rakoviny"]')
    await expect(subcategory).toBeVisible()
  })
})

test.describe('Статические страницы', () => {
  const pages = [
    { slug: 'about', title: 'О компании' },
    { slug: 'delivery', title: 'Доставка и оплата' },
    { slug: 'contacts', title: 'Контакты' },
    { slug: 'privacy', title: 'Политика конфиденциальности' },
  ]

  for (const p of pages) {
    test(`страница /${p.slug} отображается`, async ({ page }) => {
      await page.goto(`${baseURL}/${p.slug}`)

      // Страница не должна быть 404
      const notFound = page.locator('text=Страница не найдена')
      await expect(notFound).not.toBeVisible()
    })
  }
})

test.describe('Локализация', () => {
  test('на странице товара текст на русском', async ({ page }) => {
    await page.goto(`${baseURL}/products/stworki-molde-s23401wh`)

    const backLink = page.locator('a', { hasText: 'Все товары' })
    await expect(backLink).toBeVisible()
  })

  test('кнопка "В наличии" на карточке товара', async ({ page }) => {
    await page.goto(`${baseURL}/catalog/unitazy`)

    const stockText = page.locator('text=В наличии').first()
    await expect(stockText).toBeVisible()
  })
})
