// ABOUTME: Создаёт контент главной страницы, связывая категории, продукты и медиа.
// ABOUTME: Ожидает, что media-записи уже загружены (ищет по filename через payload.find).

import configPromise from '@payload-config'
import 'dotenv/config'
import { getPayload } from 'payload'

async function seedClone() {
    const payload = await getPayload({ config: configPromise })

    console.log('Fetching media...')
    const mediaList = await payload.find({
        collection: 'media',
        depth: 0,
        limit: 100,
    })

    const getMediaId = (filename: string) => {
        const m = mediaList.docs.find((d) => d.filename === filename)
        return m ? m.id : undefined
    }

    const heroImageId = getMediaId('hero_banner.png') || (mediaList.docs.length > 0 ? mediaList.docs[0].id : undefined)
    
    console.log('Creating Categories...')
    const findOrCreateCategory = async (title: string, slug: string, filename?: string) => {
        const existing = await payload.find({ collection: 'categories', where: { slug: { equals: slug } } })
        const imageId = filename ? getMediaId(filename) : undefined
        if (existing.docs.length > 0) {
            return payload.update({ 
                collection: 'categories', 
                id: existing.docs[0].id, 
                data: { title, image: imageId },
                context: { disableRevalidate: true }
            })
        }
        return payload.create({ 
            collection: 'categories', 
            data: { title, slug, image: imageId },
            context: { disableRevalidate: true }
        })
    }
    const cat1 = await findOrCreateCategory('Сантехника', 'santehnika', 'category_1.png')
    const cat2 = await findOrCreateCategory('Мебель для ванной', 'mebel', 'category_2.png')
    const cat3 = await findOrCreateCategory('Плитка Керамогранит', 'plitka', 'category_3.png')
    const cat4 = await findOrCreateCategory('Освещение', 'osveschenie', 'category_4.png')

    console.log('Creating Products...')
    const createProduct = async (title: string, price: number, filename: string, catId: any, sku: string) => {
        const existing = await payload.find({ collection: 'products', where: { sku: { equals: sku } } })
        const mediaId = getMediaId(filename) || (mediaList.docs.length > 0 ? mediaList.docs[0].id : undefined)
        
        if (existing.docs.length > 0) {
            return payload.update({
                collection: 'products',
                id: existing.docs[0].id,
                data: { title, priceInKZT: price, categories: [catId], meta: { image: mediaId } },
                context: { disableRevalidate: true }
            })
        }
        return payload.create({
            collection: 'products',
            data: {
                title,
                slug: sku.toLowerCase(),
                _status: 'published',
                priceInKZT: price,
                inStock: 'in_stock',
                sku: sku,
                rating: { value: 4.8, count: 12 },
                specs: [
                    { key: 'Бренд', value: 'Roca' },
                    { key: 'Цвет', value: 'Белый' }
                ],
                categories: [catId],
                meta: {
                    title,
                    description: `Купить ${title} по выгодной цене.`,
                    image: mediaId
                }
            },
            context: { disableRevalidate: true }
        })
    }

    // Need to upload gallery via direct modification because products requires an array
    const createProductWithGallery = async (title: string, price: number, filename: string, catId: any, sku: string) => {
        const prod = await createProduct(title, price, filename, catId, sku)
        const mediaId = getMediaId(filename) || (mediaList.docs.length > 0 ? mediaList.docs[0].id : undefined)
        if (mediaId) {
            await payload.update({
                collection: 'products',
                id: prod.id,
                data: {
                    gallery: [{ image: mediaId }]
                },
                context: { disableRevalidate: true }
            })
        }
    }

    await createProductWithGallery('Унитаз напольный Roca', 15000, 'product_1.png', cat1.id, 'ROCA-001')
    await createProductWithGallery('Раковина с тумбой', 24000, 'product_2.png', cat2.id, 'FURN-002')
    await createProductWithGallery('Керамогранит под мрамор', 1200, 'product_3.png', cat3.id, 'TILE-003')
    await createProductWithGallery('Светильник для зеркала', 4500, 'product_4.png', cat4.id, 'LIGHT-004')

    console.log('Creating Home Page...')
    const homePageData: any = {
        title: 'Главная',
        slug: 'home',
        _status: 'published',
        hero: {
            type: heroImageId ? 'highImpact' : 'lowImpact',
            richText: {
                root: {
                    type: 'root',
                    children: [
                        {
                            type: 'heading',
                            version: 1,
                            tag: 'h1',
                            children: [{ type: 'text', version: 1, text: 'Accurate.kz' }]
                        },
                        {
                            type: 'paragraph',
                            version: 1,
                            children: [{ type: 'text', version: 1, text: 'Ведущий гипермаркет сантехники в Казахстане' }]
                        }
                    ],
                    direction: 'ltr',
                    format: 'left',
                    indent: 0,
                    version: 1
                }
            },
            links: [
                { link: { type: 'custom', url: '/catalog', label: 'Перейти в каталог' } }
            ],
            media: heroImageId
        },
        layout: [
            {
                blockType: 'categoriesGrid',
                title: 'Популярные категории',
                categories: [cat1.id, cat2.id, cat3.id, cat4.id]
            },
            {
                blockType: 'servicesBlock',
                title: 'Наши услуги',
                services: [
                    { iconName: 'truck', title: 'Доставка', description: 'Быстрая доставка по всему Казахстану' },
                    { iconName: 'wrench', title: 'Установка', description: 'Монтаж с гарантией 1 год' },
                    { iconName: 'credit-card', title: 'Оплата', description: 'Любые способы оплаты' },
                ]
            }
        ],
        meta: {
            title: 'Accurate.kz - интернет магазин',
            description: 'Купить сантехнику онлайн'
        }
    }

    const existingPages = await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } } })
    if (existingPages.docs.length > 0) {
        await payload.update({ 
            collection: 'pages', 
            id: existingPages.docs[0].id, 
            data: homePageData,
            context: { disableRevalidate: true }
        })
    } else {
        await payload.create({
            collection: 'pages',
            data: homePageData,
            context: { disableRevalidate: true }
        })
    }

    console.log('Configuring Globals (Header/Footer)...')

    await payload.updateGlobal({
        slug: 'header',
        context: { disableRevalidate: true },
        data: {
            navItems: [
                { link: { type: 'custom', url: '/', label: 'Главная' } },
                { link: { type: 'custom', url: '/catalog', label: 'Каталог' } },
                { link: { type: 'custom', url: '/about', label: 'О компании' } },
                { link: { type: 'custom', url: '/delivery', label: 'Доставка' } },
            ]
        }
    })

    await payload.updateGlobal({
        slug: 'footer',
        context: { disableRevalidate: true },
        data: {
            navItems: [
                { link: { type: 'custom', url: '/catalog', label: 'Каталог товаров' } },
                { link: { type: 'custom', url: '/contacts', label: 'Контакты' } },
                { link: { type: 'custom', url: '/privacy', label: 'Политика конфиденциальности' } }
            ]
        }
    })

    console.log('Seeding completed successfully!')
    process.exit(0)
}

seedClone()
