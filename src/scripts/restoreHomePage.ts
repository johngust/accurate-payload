// ABOUTME: Восстанавливает данные и layout главной страницы до утверждённого дизайна.
// ABOUTME: Создаёт записи Promotions, FeaturedProducts и обновляет layout home (11 блоков).

import configPromise from '@payload-config'
import 'dotenv/config'
import { getPayload, type Payload } from 'payload'

// ── Promotions seed data ──────────────────────────────────────────────────────

const heroPromotions = [
  {
    title: 'Весенняя распродажа сантехники',
    subtitle: 'Скидки до 30% на унитазы, раковины и ванны',
    type: 'hero' as const,
    link: { url: '/catalog', label: 'Перейти в каталог' },
    imageId: 1, // hero_banner
  },
  {
    title: 'Новая коллекция смесителей',
    subtitle: 'Премиальные модели от ведущих брендов',
    type: 'hero' as const,
    link: { url: '/catalog?category=smesiteli', label: 'Смотреть коллекцию' },
    imageId: 8, // category_3
  },
  {
    title: 'Бесплатная доставка по Алматы',
    subtitle: 'При заказе от 50 000 ₸ — доставим бесплатно',
    type: 'hero' as const,
    link: { url: '/delivery', label: 'Подробнее' },
    imageId: 9, // category_4
  },
]

const bannerPromotions = [
  {
    title: 'Унитазы от 15 000 ₸',
    subtitle: 'Широкий выбор напольных и подвесных моделей',
    type: 'banner' as const,
    link: { url: '/catalog?category=unitazy' },
    imageId: 6, // category_1
  },
  {
    title: 'Ванны и душевые',
    subtitle: 'Акриловые ванны по специальным ценам',
    type: 'banner' as const,
    link: { url: '/catalog?category=vanny' },
    imageId: 7, // category_2
  },
  {
    title: 'Мебель для ванной',
    subtitle: 'Тумбы, зеркала и пеналы',
    type: 'banner' as const,
    link: { url: '/catalog?category=mebel' },
    imageId: 8, // category_3
  },
]

const salePromotions = [
  {
    title: 'Ликвидация остатков',
    subtitle: 'Последние позиции со скидкой до 40%',
    type: 'sale' as const,
    link: { url: '/catalog' },
    imageId: 48, // cat_2
  },
  {
    title: 'Комплект ванной под ключ',
    subtitle: 'Унитаз + раковина + смеситель = выгода',
    type: 'sale' as const,
    link: { url: '/catalog' },
    imageId: 49, // cat_1
  },
  {
    title: 'Новинки месяца',
    subtitle: 'Свежие поступления сантехники',
    type: 'sale' as const,
    link: { url: '/catalog' },
    imageId: 50, // cat_3
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

async function findOrCreatePromotion(
  payload: Payload,
  data: { title: string; subtitle: string; type: string; link: { url: string; label?: string }; imageId: number },
) {
  const existing = await payload.find({
    collection: 'promotions',
    where: { title: { equals: data.title } },
    limit: 1,
  })
  if (existing.docs.length > 0) {
    console.log(`  Промо уже существует: ${data.title}`)
    return existing.docs[0]
  }

  const promo = await payload.create({
    collection: 'promotions',
    data: {
      title: data.title,
      subtitle: data.subtitle,
      type: data.type,
      active: true,
      image: data.imageId,
      link: data.link,
    },
  })
  console.log(`  Создана промо-акция: ${data.title} (id=${promo.id})`)
  return promo
}

async function findOrCreateFeaturedProduct(
  payload: Payload,
  productId: number,
  discountPercent: number,
) {
  const existing = await payload.find({
    collection: 'featuredProducts',
    where: { active: { equals: true } },
    limit: 1,
  })
  if (existing.docs.length > 0) {
    console.log(`  Товар дня уже существует: ${existing.docs[0].title}`)
    return existing.docs[0]
  }

  const featured = await payload.create({
    collection: 'featuredProducts',
    data: {
      title: 'Товар дня',
      product: productId,
      discountPercent,
      active: true,
    },
  })
  console.log(`  Создан товар дня (id=${featured.id})`)
  return featured
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function restoreHomePage() {
  const payload = await getPayload({ config: configPromise })

  // 1. Создаём Promotions
  console.log('\n=== Создание промо-акций ===')

  const createdHeroPromos: number[] = []
  for (const promo of heroPromotions) {
    const result = await findOrCreatePromotion(payload, promo)
    createdHeroPromos.push(result.id)
  }

  const createdBannerPromos: number[] = []
  for (const promo of bannerPromotions) {
    const result = await findOrCreatePromotion(payload, promo)
    createdBannerPromos.push(result.id)
  }

  const createdSalePromos: number[] = []
  for (const promo of salePromotions) {
    const result = await findOrCreatePromotion(payload, promo)
    createdSalePromos.push(result.id)
  }

  // 2. Создаём FeaturedProduct
  console.log('\n=== Создание товара дня ===')
  // Используем Grossman GR-4455S (id=2816) — 20% скидка
  await findOrCreateFeaturedProduct(payload, 2816, 20)

  // 3. Обновляем layout home page
  console.log('\n=== Обновление layout главной ===')

  const pages = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
  })

  if (pages.docs.length === 0) {
    console.error('Страница home не найдена!')
    process.exit(1)
  }

  const homePageId = pages.docs[0].id

  // Первый sale-промо для saleWithCarousel
  const salePromoForCarousel = createdSalePromos[0]

  await payload.update({
    collection: 'pages',
    id: homePageId,
    context: { disableRevalidate: true },
    data: {
      layout: [
        // 1. Иконки категорий (авто-фетч корневых)
        {
          blockType: 'categoryIconsRow',
        },

        // 2. Промо-баннеры (3 баннера)
        {
          blockType: 'promoBanners',
          source: 'manual',
          promotions: createdBannerPromos,
        },

        // 3. Табы товаров по категориям (6 корневых)
        {
          blockType: 'categoryProductTabs',
          categories: [8, 13, 18, 23, 32, 47],
          limit: 4,
        },

        // 4. Бренды
        {
          blockType: 'brandsBlock',
          title: 'Только оригинальные бренды',
        },

        // 5. Акция + карусель товаров
        {
          blockType: 'saleWithCarousel',
          promotion: salePromoForCarousel,
          populateBy: 'collection',
          category: 8, // Унитазы
          limit: 8,
        },

        // 6. Сервисные карточки
        {
          blockType: 'serviceCards',
          cards: [
            {
              iconName: 'Banknote',
              title: 'Рассрочка 0-0-12',
              description: 'Покупайте сейчас — платите потом без переплат',
              link: { url: '/installment' },
            },
            {
              iconName: 'Wrench',
              title: 'Установка под ключ',
              description: 'Демонтаж старой и установка новой сантехники',
              link: { url: '/installation' },
            },
            {
              iconName: 'Truck',
              title: 'Доставка по Казахстану',
              description: 'Отправляем в любой город транспортной компанией',
              link: { url: '/delivery' },
            },
          ],
        },

        // 7. Готовые решения (пустой — заполняется через админку)
        {
          blockType: 'productSets',
          title: 'Популярные готовые решения',
        },

        // 8. Сетка акций (3 sale-промо)
        {
          blockType: 'promoGrid',
          title: 'Все акции в одном месте',
          promotions: createdSalePromos,
        },

        // 9. Карусель товаров
        {
          blockType: 'carousel',
          populateBy: 'collection',
          relationTo: 'products',
          limit: 10,
        },

        // 10. Галерея (пустая — заполняется через админку)
        {
          blockType: 'imageGallery',
          title: 'Идеи для дома',
        },

        // 11. Наши преимущества (8 пунктов)
        {
          blockType: 'servicesBlock',
          title: 'Почему выбирают нас',
          services: [
            {
              iconName: 'Truck',
              title: 'Доставка',
              description: 'Бесплатная доставка по Алматы от 50 000 ₸',
            },
            {
              iconName: 'Wrench',
              title: 'Установка',
              description: 'Профессиональный монтаж с гарантией',
            },
            {
              iconName: 'ShieldCheck',
              title: 'Гарантия',
              description: 'Официальная гарантия от производителя',
            },
            {
              iconName: 'CreditCard',
              title: 'Оплата',
              description: 'Наличные, карта, рассрочка до 12 месяцев',
            },
            {
              iconName: 'RotateCcw',
              title: 'Возврат',
              description: 'Обмен и возврат в течение 14 дней',
            },
            {
              iconName: 'Headphones',
              title: 'Консультация',
              description: 'Поможем подобрать подходящую сантехнику',
            },
            {
              iconName: 'BadgeCheck',
              title: 'Оригинал',
              description: 'Только сертифицированная продукция',
            },
            {
              iconName: 'Percent',
              title: 'Скидки',
              description: 'Регулярные акции и специальные предложения',
            },
          ],
        },
      ],
    },
  })

  console.log(`\nLayout обновлён на 11 блоков (страница id=${homePageId})`)
  console.log('Готово!')
  process.exit(0)
}

restoreHomePage()
