// ABOUTME: Оркестратор загрузки каталога сантехники в Payload CMS.
// ABOUTME: Создаёт категории, товары, промо-акции, бренды, домашнюю страницу и обновляет навигацию.

import configPromise from '@payload-config'
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'

import { categories } from './categories'
import { products } from './products'

const IMAGES_DIR = path.resolve(process.cwd(), 'src/scripts/parser/images')
const MAPPING_PATH = path.join(IMAGES_DIR, 'mapping.json')

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

function loadImageMapping(): Record<string, string> {
  if (!fs.existsSync(MAPPING_PATH)) return {}
  return JSON.parse(fs.readFileSync(MAPPING_PATH, 'utf-8'))
}

async function uploadImage(payload: Payload, slug: string, filename: string): Promise<number> {
  // Проверяем, не загружено ли уже
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })
  if (existing.docs.length > 0) {
    return existing.docs[0].id
  }

  const filePath = path.join(IMAGES_DIR, filename)
  if (!fs.existsSync(filePath)) {
    throw new Error(`Файл не найден: ${filePath}`)
  }

  const data = fs.readFileSync(filePath)
  const ext = path.extname(filename).toLowerCase()
  const mimetype = ext === '.png' ? 'image/png' : 'image/jpeg'

  const media = await payload.create({
    collection: 'media',
    data: {
      alt: slug,
    },
    file: {
      data,
      mimetype,
      name: filename,
      size: data.byteLength,
    },
  })

  return media.id
}

async function seedProducts(payload: Payload, categoryMap: Map<string, number>) {
  console.log('\n=== Создание товаров ===')
  const imageMapping = loadImageMapping()

  for (const prod of products) {
    const categoryId = categoryMap.get(prod.categorySlug)
    if (!categoryId) {
      console.warn(`  [пропуск] Категория не найдена: ${prod.categorySlug}`)
      continue
    }

    // Загрузка изображения
    let gallery: { image: number }[] | undefined
    const imageFile = imageMapping[prod.slug]
    if (imageFile) {
      try {
        const mediaId = await uploadImage(payload, prod.slug, imageFile)
        gallery = [{ image: mediaId }]
      } catch (err) {
        console.warn(`  [изображение] ошибка для ${prod.slug}: ${(err as Error).message}`)
      }
    }

    const existing = await payload.find({
      collection: 'products',
      where: { sku: { equals: prod.sku } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      const doc = existing.docs[0]
      // Обновляем gallery если товар существует, но без изображений
      if (gallery && (!doc.gallery || doc.gallery.length === 0)) {
        await payload.update({
          collection: 'products',
          id: doc.id,
          data: { gallery },
        })
        console.log(`  [обновлён gallery] ${prod.sku} — ${prod.title}`)
      } else {
        console.log(`  [существует] ${prod.sku} — ${prod.title}`)
      }
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
        gallery,
        meta: {
          title: prod.title,
          description: `Купить ${prod.title} по выгодной цене с доставкой.`,
        },
      },
    })
    console.log(`  [создан] ${prod.sku} — ${prod.title}`)
  }
}

async function createPlaceholderImage(
  payload: Payload,
  text: string,
  color: string,
  width = 800,
  height = 400,
): Promise<number> {
  const filename = `placeholder-${text.replace(/\s+/g, '-').toLowerCase().slice(0, 30)}.png`
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })
  if (existing.docs.length > 0) return existing.docs[0].id

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${color}"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="32" font-family="Arial">${text}</text>
  </svg>`

  const buffer = await sharp(Buffer.from(svg)).png().toBuffer()

  const media = await payload.create({
    collection: 'media',
    data: { alt: text },
    file: { data: buffer, mimetype: 'image/png', name: filename, size: buffer.byteLength },
  })
  return media.id
}

const promotionsData = [
  // Hero-слайды
  {
    title: 'Выгодные цены на сантехнику',
    subtitle: 'Скидки до 50% на популярные модели',
    type: 'hero' as const,
    link: { url: '/catalog', label: 'В каталог' },
  },
  {
    title: 'Новинки сезона',
    subtitle: 'Лучшие предложения от STWORKI и DIWO',
    type: 'hero' as const,
    link: { url: '/catalog/unitazy', label: 'Смотреть' },
  },
  {
    title: 'Бесплатная доставка',
    subtitle: 'При заказе от 10 000 ₽',
    type: 'hero' as const,
    link: { url: '/delivery', label: 'Подробнее' },
  },
  // Баннеры
  {
    title: 'Унитазы со скидкой',
    subtitle: 'Напольные и подвесные модели',
    type: 'banner' as const,
    link: { url: '/catalog/unitazy', label: 'Выбрать' },
  },
  {
    title: 'Смесители от 3 500 ₽',
    subtitle: 'Широкий выбор для ванной и кухни',
    type: 'banner' as const,
    link: { url: '/catalog/smesiteli', label: 'Выбрать' },
  },
  {
    title: 'Акриловые ванны',
    subtitle: 'Европейское качество',
    type: 'banner' as const,
    link: { url: '/catalog/vanny', label: 'Выбрать' },
  },
  // Акции (sale)
  {
    title: 'Ликвидация складских остатков',
    subtitle: 'Скидки до 70%',
    type: 'sale' as const,
    link: { url: '/catalog', label: 'К акции' },
  },
  {
    title: 'Чёрная пятница',
    subtitle: 'Лучшие цены года',
    type: 'sale' as const,
    link: { url: '/catalog', label: 'К акции' },
  },
  {
    title: 'Подарок при покупке',
    subtitle: 'Набор аксессуаров в подарок при заказе от 15 000 ₽',
    type: 'sale' as const,
    link: { url: '/catalog', label: 'Подробнее' },
  },
]

const promoColors: Record<string, string> = {
  hero: '#2563eb',
  banner: '#059669',
  sale: '#dc2626',
}

async function seedPromotions(payload: Payload) {
  console.log('\n=== Создание промо-акций ===')

  for (const promo of promotionsData) {
    const existing = await payload.find({
      collection: 'promotions',
      where: { title: { equals: promo.title } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      console.log(`  [существует] ${promo.title}`)
      continue
    }

    const imageId = await createPlaceholderImage(
      payload,
      promo.title,
      promoColors[promo.type],
    )

    await payload.create({
      collection: 'promotions',
      data: {
        title: promo.title,
        subtitle: promo.subtitle,
        image: imageId,
        type: promo.type,
        active: true,
        link: promo.link,
      },
    })
    console.log(`  [создана] ${promo.type}: ${promo.title}`)
  }
}

async function seedFeaturedProduct(payload: Payload) {
  console.log('\n=== Создание «Товара дня» ===')

  const existing = await payload.find({
    collection: 'featuredProducts',
    where: { title: { equals: 'Товар дня' } },
    limit: 1,
  })
  if (existing.docs.length > 0) {
    console.log('  [существует] Товар дня')
    return
  }

  const product = await payload.find({
    collection: 'products',
    where: { _status: { equals: 'published' } },
    limit: 1,
  })
  if (product.docs.length === 0) {
    console.warn('  [пропуск] Нет опубликованных товаров')
    return
  }

  await payload.create({
    collection: 'featuredProducts',
    data: {
      title: 'Товар дня',
      product: product.docs[0].id,
      discountPercent: 25,
      active: true,
    },
  })
  console.log(`  [создан] Товар дня — ${product.docs[0].title}`)
}

const brandsData = [
  { name: 'STWORKI', color: '#1e3a5f' },
  { name: 'DIWO', color: '#2d5016' },
  { name: 'Domaci', color: '#6b21a8' },
  { name: 'EWRIKA', color: '#b91c1c' },
  { name: 'Boheme', color: '#92400e' },
  { name: 'Indigo', color: '#1e40af' },
  { name: 'SantiLine', color: '#0f766e' },
  { name: 'Jacob Delafon', color: '#374151' },
  { name: 'BOND', color: '#7c2d12' },
]

async function seedBrands(payload: Payload) {
  console.log('\n=== Создание брендов ===')

  for (let i = 0; i < brandsData.length; i++) {
    const brand = brandsData[i]
    const existing = await payload.find({
      collection: 'brands',
      where: { name: { equals: brand.name } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      console.log(`  [существует] ${brand.name}`)
      continue
    }

    const logoId = await createPlaceholderImage(payload, brand.name, brand.color, 200, 80)

    await payload.create({
      collection: 'brands',
      data: {
        name: brand.name,
        logo: logoId,
        sortOrder: i,
      },
    })
    console.log(`  [создан] ${brand.name}`)
  }
}

async function seedHomePage(payload: Payload, categoryMap: Map<string, number>) {
  console.log('\n=== Создание домашней страницы ===')

  // Получаем ID первой sale-акции для saleWithCarousel
  const salePromos = await payload.find({
    collection: 'promotions',
    where: { type: { equals: 'sale' }, active: { equals: true } },
    limit: 1,
  })
  if (salePromos.docs.length === 0) {
    console.warn('  [пропуск] Нет sale-акций для saleWithCarousel')
    return
  }
  const salePromoId = salePromos.docs[0].id

  // Placeholder-изображения для ProductSets
  const setImage1 = await createPlaceholderImage(payload, 'Комплект для ванной', '#475569', 400, 300)
  const setImage2 = await createPlaceholderImage(payload, 'Смесители', '#475569', 400, 300)
  const setImage3 = await createPlaceholderImage(payload, 'Полный комплект', '#475569', 400, 300)

  // ID всех 6 корневых категорий
  const rootCategorySlugs = ['unitazy', 'rakoviny', 'vanny', 'smesiteli', 'polotencesushiteli', 'bide']
  const rootCategoryIds = rootCategorySlugs
    .map((slug) => categoryMap.get(slug))
    .filter((id): id is number => id !== undefined)

  const layout = [
    { blockType: 'categoryIconsRow' as const, categories: [] as number[] },
    { blockType: 'promoBanners' as const, source: 'all_active' as const },
    {
      blockType: 'categoryProductTabs' as const,
      categories: rootCategoryIds,
      limit: 4,
    },
    { blockType: 'brandsBlock' as const, title: 'Только оригинальные бренды' },
    {
      blockType: 'saleWithCarousel' as const,
      promotion: salePromoId,
      populateBy: 'collection' as const,
      category: categoryMap.get('unitazy'),
      limit: 4,
    },
    {
      blockType: 'serviceCards' as const,
      cards: [
        {
          iconName: 'CreditCard',
          title: 'Рассрочка 0%',
          description: 'Оформите покупку в рассрочку без переплат от наших банков-партнёров',
        },
        {
          iconName: 'Wrench',
          title: 'Установка',
          description: 'Профессиональный монтаж сантехники с гарантией на работы',
        },
        {
          iconName: 'Truck',
          title: 'Доставка по России',
          description: 'Бесплатная доставка при заказе от 10 000 ₽',
        },
      ],
    },
    {
      blockType: 'productSets' as const,
      title: 'Популярные готовые решения',
      sets: [
        { title: 'Комплект для ванной: унитаз + раковина', price: 25900, image: setImage1 },
        { title: 'Смесители для ванной комнаты', price: 18500, image: setImage2 },
        { title: 'Полный комплект сантехники', price: 45000, image: setImage3 },
      ],
    },
    { blockType: 'promoGrid' as const, title: 'Все акции в одном месте' },
    {
      blockType: 'carousel' as const,
      populateBy: 'collection' as const,
      relationTo: 'products' as const,
      limit: 12,
    },
    { blockType: 'servicesBlock' as const },
  ]

  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    await payload.update({
      collection: 'pages',
      id: existing.docs[0].id,
      context: { disableRevalidate: true },
      data: { layout },
    })
    console.log('  [обновлена] home')
  } else {
    await payload.create({
      collection: 'pages',
      context: { disableRevalidate: true },
      data: {
        title: 'Главная',
        slug: 'home',
        _status: 'published',
        hero: { type: 'none' },
        layout,
        meta: {
          title: 'Сантехника-Онлайн — интернет-магазин сантехники',
          description: 'Широкий выбор сантехники по выгодным ценам с доставкой по всей России.',
        },
      },
    })
    console.log('  [создана] home — Главная')
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
      columns: [
        {
          title: 'О компании',
          links: [
            { label: 'О нас', url: '/about' },
            { label: 'Контакты', url: '/contacts' },
            { label: 'Политика конфиденциальности', url: '/privacy' },
          ],
        },
        {
          title: 'Каталог',
          links: [
            { label: 'Унитазы', url: '/catalog/unitazy' },
            { label: 'Раковины', url: '/catalog/rakoviny' },
            { label: 'Ванны', url: '/catalog/vanny' },
            { label: 'Смесители', url: '/catalog/smesiteli' },
          ],
        },
        {
          title: 'Покупателям',
          links: [
            { label: 'Доставка и оплата', url: '/delivery' },
            { label: 'Все акции', url: '/catalog' },
          ],
        },
      ],
      contactPhone: '8 (800) 100-00-00',
      contactEmail: 'info@santehnika-online.ru',
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
  await seedPromotions(payload)
  await seedFeaturedProduct(payload)
  await seedBrands(payload)
  await seedStaticPages(payload)
  await seedHomePage(payload, categoryMap)
  await updateGlobals(payload)

  console.log('\n=== Загрузка завершена ===')
  process.exit(0)
}

main().catch((err) => {
  console.error('Ошибка:', err)
  process.exit(1)
})
