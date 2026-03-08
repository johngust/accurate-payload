import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { MigrationLogger } from '../lib/migration/logger'
import { CategoryService } from '../lib/migration/category-service'
import { ProductService } from '../lib/migration/product-service'
import { MediaUploader } from '../lib/migration/media-uploader'
import fs from 'fs'
import path from 'path'

async function main() {
  const isDryRun = process.argv.includes('--dry-run')
  const logger = new MigrationLogger(isDryRun)
  
  const jsonPath = path.resolve(process.cwd(), 'migration_all_data.json')
  
  if (!fs.existsSync(jsonPath)) {
    logger.error(`Migration file not found at ${jsonPath}. Please export it from Bitrix first.`)
    process.exit(1)
  }

  logger.info('Starting Offline Migration from JSON', { isDryRun })

  // Initialize Payload
  logger.info('Initializing Payload CMS...')
  const payload = await getPayload({ config: configPromise })

  const rawData = fs.readFileSync(jsonPath, 'utf-8')
  let data: any
  
  try {
    data = JSON.parse(rawData)
  } catch (err) {
    logger.error('Failed to parse migration_all_data.json. Make sure it is a valid JSON file, not an HTML error page.')
    process.exit(1)
  }

  if (!data.categories || !data.products) {
    logger.error('Invalid JSON structure. Expected "categories" and "products" arrays.')
    process.exit(1)
  }

  logger.info(`Loaded ${data.categories.length} categories and ${data.products.length} products from file.`)

  const mediaUploader = new MediaUploader({ logger, payload })

  // 1. Migrate Categories
  logger.info('Migrating categories...')
  for (const cat of data.categories) {
    const bitrixId = parseInt(cat.ID, 10)
    if (isDryRun) {
      logger.info(`[DRY RUN] Would create category: ${cat.NAME} (${bitrixId})`)
      continue
    }

    try {
      const existing = await payload.find({
        collection: 'categories',
        where: { bitrixId: { equals: bitrixId } },
      })

      const categoryData = {
        title: cat.NAME,
        bitrixId,
        // Parent assignment would need a second pass or careful sorting
      }

      if (existing.docs.length > 0) {
        await payload.update({ collection: 'categories', id: existing.docs[0].id, data: categoryData })
      } else {
        await payload.create({ collection: 'categories', data: categoryData })
      }
    } catch (err: any) {
      logger.error(`Failed to migrate category ${cat.NAME}: ${err.message}`)
    }
  }

  // 2. Assign Parents to Categories
  if (!isDryRun) {
    logger.info('Assigning parent categories...')
    for (const cat of data.categories) {
        if (cat.PARENT_ID) {
            const bitrixId = parseInt(cat.ID, 10)
            const parentBitrixId = parseInt(cat.PARENT_ID, 10)
            
            const current = await payload.find({ collection: 'categories', where: { bitrixId: { equals: bitrixId } } })
            const parent = await payload.find({ collection: 'categories', where: { bitrixId: { equals: parentBitrixId } } })
            
            if (current.docs.length > 0 && parent.docs.length > 0) {
                await payload.update({
                    collection: 'categories',
                    id: current.docs[0].id,
                    data: { parent: parent.docs[0].id }
                })
            }
        }
    }
  }

  // 3. Migrate Products
  logger.info('Migrating products and images...')
  for (const prod of data.products) {
    const bitrixId = parseInt(prod.ID, 10)
    if (isDryRun) {
      logger.info(`[DRY RUN] Would migrate product: ${prod.NAME} (${bitrixId})`)
      continue
    }

    try {
      // Find category
      let categoryId = null
      if (prod.SECTION_ID) {
        const catRes = await payload.find({
          collection: 'categories',
          where: { bitrixId: { equals: parseInt(prod.SECTION_ID, 10) } }
        })
        if (catRes.docs.length > 0) categoryId = catRes.docs[0].id
      }

      // Handle Image
      let mediaId = null
      if (prod.IMAGE) {
        mediaId = await mediaUploader.uploadFromUrl(prod.IMAGE, `product-${bitrixId}.jpg`, bitrixId)
      }

      const productData: any = {
        title: prod.NAME,
        bitrixId,
        _status: 'published',
        categories: categoryId ? [categoryId] : [],
        // Simplified description for JSON migration
        description: {
            root: {
                type: 'root',
                children: [{
                    type: 'paragraph',
                    children: [{ type: 'text', text: prod.DESCRIPTION || '' }]
                }]
            }
        }
      }

      if (mediaId) {
        productData.gallery = [{ image: mediaId }]
      }

      const existing = await payload.find({
        collection: 'products',
        where: { bitrixId: { equals: bitrixId } }
      })

      if (existing.docs.length > 0) {
        await payload.update({ collection: 'products', id: existing.docs[0].id, data: productData })
        logger.debug(`Updated product: ${prod.NAME}`)
      } else {
        await payload.create({ collection: 'products', data: productData })
        logger.debug(`Created product: ${prod.NAME}`)
      }
    } catch (err: any) {
      logger.error(`Failed to migrate product ${prod.NAME}: ${err.message}`)
    }
  }

  logger.success('Offline migration finished.')
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
