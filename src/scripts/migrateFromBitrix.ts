import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { BitrixClient } from '../lib/bitrix'
import { MigrationLogger } from '../lib/migration/logger'
import { CategoryService } from '../lib/migration/category-service'
import { ProductService } from '../lib/migration/product-service'
import { MediaUploader } from '../lib/migration/media-uploader'

async function main() {
  const args = process.argv.slice(2)
  const isDryRun = args.includes('--dry-run')
  const limitArgIndex = args.indexOf('--limit')
  const limit = limitArgIndex !== -1 ? parseInt(args[limitArgIndex + 1], 10) : 0
  
  const typeArgIndex = args.indexOf('--type')
  const migrationType = typeArgIndex !== -1 ? args[typeArgIndex + 1] : 'all'

  const logger = new MigrationLogger(isDryRun)
  
  const restUrl = process.env.BITRIX_REST_URL
  
  if (!restUrl) {
    logger.error('BITRIX_REST_URL is missing in environment variables.')
    process.exit(1)
  }

  logger.info('Starting Bitrix to Payload migration', { isDryRun, limit, migrationType })

  // Initialize Payload
  logger.info('Initializing Payload CMS...')
  const payload = await getPayload({ config: configPromise })

  const bitrix = new BitrixClient({
    restUrl,
    logger
  })

  logger.info('Checking connection to Bitrix...')
  const conn = await bitrix.checkConnection()
  
  if (!conn.connected) {
    logger.error('Failed to connect to Bitrix API. Check your BITRIX_REST_URL and network access.')
    process.exit(1)
  }
  
  logger.success('Connection verified!', { version: conn.version })
  
  const mediaUploader = new MediaUploader({ logger, payload })

  if (migrationType === 'categories' || migrationType === 'all') {
    const categoryService = new CategoryService({ bitrix, logger, payload })
    await categoryService.migrateCategories(limit, isDryRun)
  }
  
  if (migrationType === 'products' || migrationType === 'all') {
    const productService = new ProductService({ bitrix, logger, mediaUploader, payload })
    await productService.migrateProducts(limit, isDryRun)
  }
  
  logger.success('Migration script finished.')
  process.exit(0)
}

main().catch(err => {
  console.error('Unhandled error in migration script:', err)
  process.exit(1)
})
