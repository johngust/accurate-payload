import 'dotenv/config'
import fetch from 'cross-fetch'
import { XMLParser } from 'fast-xml-parser'
import he from 'he'
import { MigrationLogger } from '../lib/migration/logger'
import { MediaUploader } from '../lib/migration/media-uploader'
import { convertHtmlToLexical } from '../lib/migration/html-to-lexical'
import slugify from 'slugify'
import payload from 'payload'

// --- Types ---
interface YMLCategory {
  '@_id': string
  '@_parentId'?: string
  '#text': string
}

interface YMLOffer {
  '@_id': string
  '@_available': string
  name: string
  price?: string
  categoryId: string
  picture?: string | string[]
  description?: string
  vendor?: string
  param?: Array<{'@_name': string, '#text': string}> | {'@_name': string, '#text': string}
}

async function main() {
  const args = process.argv.slice(2)
  const isDryRun = args.includes('--dry-run')
  const limitArgIndex = args.indexOf('--limit')
  const limit = limitArgIndex !== -1 ? parseInt(args[limitArgIndex + 1], 10) : 0
  
  const logger = new MigrationLogger(isDryRun)
  
  // У нас есть публичный YML-фид
  const ymlUrl = 'https://vsedlyavanny.kz/yandex.php'
  
  logger.info('Starting Bitrix YML to Payload migration', { isDryRun, limit, source: ymlUrl })

  if (!isDryRun && !payload) {
     logger.error('Payload CMS instance is not initialized. Run this script in a Payload context.')
     process.exit(1)
  }

  const mediaUploader = new MediaUploader({ logger })

  try {
    logger.info(`Downloading YML from ${ymlUrl}...`)
    const response = await fetch(ymlUrl)
    
    if (!response.ok) {
        throw new Error(`Failed to fetch YML: ${response.statusText}`)
    }
    
    const xmlData = await response.text()
    logger.info(`Downloaded ${xmlData.length} bytes of XML data.`)

    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        textNodeName: '#text',
        parseAttributeValue: true,
        cdataPropName: '__cdata' // some feeds use CDATA for descriptions
    })

    logger.info('Parsing XML...')
    const parsed = parser.parse(xmlData)
    
    if (!parsed.yml_catalog || !parsed.yml_catalog.shop) {
        throw new Error('Invalid YML format: missing yml_catalog.shop')
    }

    const shop = parsed.yml_catalog.shop
    
    // --- Parse Categories ---
    let categories: YMLCategory[] = shop.categories?.category || []
    if (!Array.isArray(categories)) {
        categories = [categories]
    }
    logger.info(`Found ${categories.length} categories.`)

    // Sort categories to process parents first
    const sortedCategories = [...categories].sort((a, b) => {
        if (!a['@_parentId'] && b['@_parentId']) return -1
        if (a['@_parentId'] && !b['@_parentId']) return 1
        return 0
    })

    // Migrate Categories
    logger.info('Migrating categories...')
    let catCount = 0
    for (const cat of sortedCategories) {
        const bitrixId = parseInt(cat['@_id'], 10)
        const title = he.decode(cat['#text'] || '')
        
        if (isDryRun) {
            logger.debug(`[DRY RUN] Category: ${title} (ID: ${bitrixId}, Parent: ${cat['@_parentId'] || 'None'})`)
            continue
        }

        const existingParams = {
            collection: 'categories' as const,
            where: { bitrixId: { equals: bitrixId } },
            limit: 1,
        }
        
        const existing = await payload.find(existingParams)
        
        let parentId = null
        if (cat['@_parentId']) {
            const pId = parseInt(cat['@_parentId'], 10)
            const pRes = await payload.find({
                collection: 'categories',
                where: { bitrixId: { equals: pId } },
                limit: 1,
            })
            if (pRes.docs.length > 0) {
                parentId = pRes.docs[0].id
            }
        }

        const catData = {
            title,
            bitrixId,
            ...(parentId ? { parent: parentId } : {})
        }

        if (existing.docs.length > 0) {
            await payload.update({
                collection: 'categories',
                id: existing.docs[0].id,
                data: catData,
            })
        } else {
            await payload.create({
                collection: 'categories',
                data: catData,
            })
        }
        catCount++
    }
    
    if (!isDryRun) logger.success(`Migrated ${catCount} categories.`)

    // --- Parse Offers (Products) ---
    let offers: YMLOffer[] = shop.offers?.offer || []
    if (!Array.isArray(offers)) {
        offers = [offers]
    }
    logger.info(`Found ${offers.length} products.`)

    let prodCount = 0
    for (const offer of offers) {
        if (limit > 0 && prodCount >= limit) break
        
        const bitrixId = parseInt(offer['@_id'], 10)
        const title = he.decode(offer.name || 'Без названия')
        
        if (isDryRun) {
            logger.debug(`[DRY RUN] Product: ${title} (ID: ${bitrixId})`)
            prodCount++
            continue
        }

        // 1. Find existing product
        const existing = await payload.find({
            collection: 'products',
            where: { bitrixId: { equals: bitrixId } },
            limit: 1,
        })

        // 2. Map category
        let categoryIds: string[] = []
        if (offer.categoryId) {
            const catBitrixId = parseInt(offer.categoryId, 10)
            const catRes = await payload.find({
                collection: 'categories',
                where: { bitrixId: { equals: catBitrixId } },
                limit: 1,
            })
            if (catRes.docs.length > 0) {
                categoryIds.push(catRes.docs[0].id)
            }
        }

        // 3. Handle image
        let mediaId: string | null = null
        if (offer.picture) {
            const imgUrl = Array.isArray(offer.picture) ? offer.picture[0] : offer.picture
            if (imgUrl) {
                mediaId = await mediaUploader.uploadFromUrl(imgUrl, `product-${bitrixId}.jpg`, bitrixId, false)
            }
        }

        // 4. Handle description and specs
        const rawDesc = offer.description ? (offer.description as any).__cdata || offer.description : ''
        const descriptionLexical = convertHtmlToLexical(he.decode(rawDesc))
        
        let inStock = 'out_of_stock'
        if (offer['@_available'] === 'true') {
            inStock = 'in_stock'
        }

        // Extract specs from YML params
        const specs: any[] = []
        if (offer.vendor) {
            specs.push({ key: 'Бренд', value: offer.vendor })
        }
        if (offer.param) {
            const params = Array.isArray(offer.param) ? offer.param : [offer.param]
            params.forEach(p => {
                if (p['@_name'] && p['#text']) {
                    specs.push({ key: p['@_name'], value: p['#text'] })
                }
            })
        }

        // We could also map price if we extended the Payload collections, 
        // but currently we focus on content (description, images, names)

        const productData: any = {
            title,
            bitrixId,
            slug: slugify(title, { lower: true, strict: true }) + `-${bitrixId}`,
            _status: 'published',
            categories: categoryIds,
            description: descriptionLexical,
            inStock,
            specs,
        }

        if (mediaId) {
            productData.gallery = [
                { image: mediaId }
            ]
        }

        if (existing.docs.length > 0) {
            await payload.update({
                collection: 'products',
                id: existing.docs[0].id,
                data: productData,
            })
            logger.debug(`Updated product: ${title}`)
        } else {
            await payload.create({
                collection: 'products',
                data: productData,
            })
            logger.debug(`Created product: ${title}`)
        }

        prodCount++
    }

    logger.success('YML Migration finished successfully.')
    process.exit(0)

  } catch (error: any) {
      logger.error('Migration failed', { error: error.message })
      process.exit(1)
  }
}

main().catch(err => {
  console.error('Unhandled error in migration script:', err)
  process.exit(1)
})
