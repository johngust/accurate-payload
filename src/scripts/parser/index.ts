// ABOUTME: Оркестратор загрузки каталога сантехники в Payload CMS.
// ABOUTME: Создаёт категории, товары, статические страницы и обновляет навигацию.

import configPromise from '@payload-config'
import 'dotenv/config'
import { getPayload, type Payload } from 'payload'

import { categories } from './categories'
import { products } from './products'

async function findOrCreateCategory(
  payload: Payload,
  slug: string,
  data: { title: string; slug: string; parent?: number },
) {
  const existing = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  if (existing.docs.length > 0) {
    console.log(`  [существует] ${slug}`)
    return existing.docs[0]
  }
  const created = await payload.create({
    collection: 'categories',
    data,
  })
  console.log(`  [создана] ${slug}`)
  return created
}

async function seedCategories(payload: Payload) {
  console.log('\n=== Создание категорий ===')
  const categoryMap = new Map<string, number>()

  for (const cat of categories) {
    const created = await findOrCreateCategory(payload, cat.slug, {
      title: cat.title,
      slug: cat.slug,
    })
    categoryMap.set(cat.slug, created.id)

    if (cat.children) {
      for (const child of cat.children) {
        const childCreated = await findOrCreateCategory(payload, child.slug, {
          title: child.title,
          slug: child.slug,
          parent: created.id,
        })
        categoryMap.set(child.slug, childCreated.id)
      }
    }
  }

  return categoryMap
}

async function seedProducts(payload: Payload, categoryMap: Map<string, number>) {
  console.log('\n=== Создание товаров ===')

  for (const prod of products) {
    const categoryId = categoryMap.get(prod.categorySlug)
    if (!categoryId) {
      console.warn(`  [пропуск] Категория не найдена: ${prod.categorySlug}`)
      continue
    }

    const existing = await payload.find({
      collection: 'products',
      where: { sku: { equals: prod.sku } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`  [существует] ${prod.sku} — ${prod.title}`)
      continue
    }

    await payload.create({
      collection: 'products',
      data: {
        title: prod.title,
        slug: prod.slug,
        _status: 'published',
        priceInUSD: prod.price,
        inStock: prod.inStock,
        sku: prod.sku,
        rating: prod.rating,
        specs: prod.specs,
        categories: [categoryId],
        meta: {
          title: prod.title,
          description: `Купить ${prod.title} по выгодной цене с доставкой.`,
        },
      },
    })
    console.log(`  [создан] ${prod.sku} — ${prod.title}`)
  }
}

function richText(text: string) {
  return {
    root: {
      type: 'root',
      children: text.split('\n\n').map((paragraph) => ({
        type: 'paragraph',
        version: 1,
        children: [{ type: 'text', version: 1, text: paragraph }],
      })),
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

const staticPages = [
  {
    title: 'О компании',
    slug: 'about',
    content:
      'Мы — один из крупнейших интернет-магазинов сантехники в России. Наша миссия — сделать качественную сантехнику доступной каждому.\n\nМы работаем с 2005 года и за это время обслужили более 500 000 клиентов. В нашем каталоге представлено более 100 000 товаров от ведущих мировых производителей.\n\nНаши преимущества: широкий ассортимент, выгодные цены, быстрая доставка по всей России, профессиональная консультация и гарантия на все товары.',
  },
  {
    title: 'Доставка и оплата',
    slug: 'delivery',
    content:
      'Мы доставляем товары по всей России. Доставка по Москве и Московской области — от 1 дня. Доставка в регионы — от 3 до 7 рабочих дней.\n\nБесплатная доставка при заказе от 10 000 ₽. Стоимость доставки рассчитывается автоматически при оформлении заказа.\n\nСпособы оплаты: банковская карта, наличные при получении, безналичный расчёт для юридических лиц, рассрочка от банков-партнёров.\n\nВозврат товара возможен в течение 14 дней с момента получения при сохранении товарного вида и упаковки.',
  },
  {
    title: 'Контакты',
    slug: 'contacts',
    content:
      'Телефон: 8 (800) 100-00-00 (бесплатно по России)\nEmail: info@santehnika-online.ru\n\nГрафик работы:\nПн-Пт: 9:00 — 21:00\nСб-Вс: 10:00 — 20:00\n\nШоурум: г. Москва, ул. Примерная, д. 1\nСклад: г. Москва, ул. Складская, д. 15\n\nМы всегда рады помочь вам с выбором сантехники. Наши консультанты — специалисты с многолетним опытом.',
  },
  {
    title: 'Политика конфиденциальности',
    slug: 'privacy',
    content:
      'Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сайта.\n\nМы собираем персональные данные (имя, email, телефон, адрес доставки) исключительно для обработки заказов и улучшения качества обслуживания.\n\nМы не передаём персональные данные третьим лицам без согласия пользователя, за исключением случаев, предусмотренных законодательством РФ.\n\nДля защиты данных используются современные технологии шифрования и безопасного хранения информации.\n\nПользователь имеет право запросить удаление своих персональных данных, направив запрос на email: privacy@santehnika-online.ru.',
  },
]

async function seedStaticPages(payload: Payload) {
  console.log('\n=== Создание статических страниц ===')

  for (const page of staticPages) {
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: page.slug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`  [существует] ${page.slug}`)
      continue
    }

    await payload.create({
      collection: 'pages',
      context: { disableRevalidate: true },
      data: {
        title: page.title,
        slug: page.slug,
        _status: 'published',
        hero: {
          type: 'none',
        },
        layout: [
          {
            blockType: 'content',
            columns: [
              {
                size: 'full',
                richText: richText(page.content),
              },
            ],
          },
        ],
        meta: {
          title: `${page.title} — Сантехника-Онлайн`,
          description: page.content.slice(0, 160),
        },
      },
    })
    console.log(`  [создана] ${page.slug} — ${page.title}`)
  }
}

async function updateGlobals(payload: Payload) {
  console.log('\n=== Обновление навигации ===')

  await payload.updateGlobal({
    slug: 'header',
    context: { disableRevalidate: true },
    data: {
      navItems: [
        { link: { type: 'custom', url: '/', label: 'Главная' } },
        { link: { type: 'custom', url: '/catalog', label: 'Каталог' } },
        { link: { type: 'custom', url: '/about', label: 'О компании' } },
        { link: { type: 'custom', url: '/delivery', label: 'Доставка' } },
        { link: { type: 'custom', url: '/contacts', label: 'Контакты' } },
      ],
    },
  })
  console.log('  Header обновлён')

  await payload.updateGlobal({
    slug: 'footer',
    context: { disableRevalidate: true },
    data: {
      navItems: [
        { link: { type: 'custom', url: '/catalog', label: 'Каталог товаров' } },
        { link: { type: 'custom', url: '/about', label: 'О компании' } },
        { link: { type: 'custom', url: '/delivery', label: 'Доставка и оплата' } },
        { link: { type: 'custom', url: '/contacts', label: 'Контакты' } },
        { link: { type: 'custom', url: '/privacy', label: 'Политика конфиденциальности' } },
      ],
    },
  })
  console.log('  Footer обновлён')
}

async function main() {
  console.log('Запуск загрузки каталога...')
  const payload = await getPayload({ config: configPromise })

  const categoryMap = await seedCategories(payload)
  console.log(`\nКатегорий в индексе: ${categoryMap.size}`)

  await seedProducts(payload, categoryMap)
  await seedStaticPages(payload)
  await updateGlobals(payload)

  console.log('\n=== Загрузка завершена ===')
  process.exit(0)
}

main().catch((err) => {
  console.error('Ошибка:', err)
  process.exit(1)
})
