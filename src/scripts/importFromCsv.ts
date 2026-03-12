import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { MigrationLogger } from '../lib/migration/logger'
import { MediaUploader } from '../lib/migration/media-uploader'
import { convertHtmlToLexical } from '../lib/migration/html-to-lexical'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse'
import slugify from 'slugify'

async function main() {
  const isDryRun = process.argv.includes('--dry-run')
  const limitArgIndex = process.argv.indexOf('--limit')
  const limit = limitArgIndex !== -1 ? parseInt(process.argv[limitArgIndex + 1], 10) : 0
  
  const logger = new MigrationLogger(isDryRun)
  const csvPath = path.resolve(process.cwd(), 'export_file_287799.csv')
  const errorLogPath = path.resolve(process.cwd(), 'import_errors.log')
  
  if (fs.existsSync(errorLogPath)) fs.unlinkSync(errorLogPath)

  function logErrorToFile(message: string) {
    const timestamp = new Date().toISOString()
    fs.appendFileSync(errorLogPath, `[${timestamp}] ${message}\n`)
  }

  if (!fs.existsSync(csvPath)) {
    logger.error(`CSV file not found at ${csvPath}`)
    process.exit(1)
  }

  logger.info('Starting Optimized CSV Migration', { isDryRun, limit })

  logger.info('Initializing Payload CMS...')
  const payload = await getPayload({ config: configPromise })
  const mediaUploader = new MediaUploader({ logger, payload })

  const COL = {
    ID: 0,
    NAME: 1,
    DETAIL_TEXT: 3,
    IMAGE: 62,
    CAT0: 150,
    CAT1: 151,
    CAT2: 152,
    PRICE: 160,
  }

  const parser = fs.createReadStream(csvPath, { encoding: 'utf8' }).pipe(
    parse({
      delimiter: ';',
      relax_quotes: true,
      relax_column_count: true,
      skip_empty_lines: true,
      from_line: 2
    })
  )

  let rowCount = 0
  let successCount = 0
  let errorCount = 0
  let consecutiveErrorCount = 0
  const processedIds = new Set<number>()

  for await (const row of parser) {
    if (limit > 0 && rowCount >= limit) break

    try {
      const bitrixIdStr = row[COL.ID]
      let title = row[COL.NAME]
      
      if (!bitrixIdStr || !title || isNaN(parseInt(bitrixIdStr, 10))) continue
      
      // Normalize Unicode (NFC) to avoid issues with decomposed characters
      title = title.normalize('NFC')
      const bitrixId = parseInt(bitrixIdStr, 10)
      if (processedIds.has(bitrixId)) continue
      processedIds.add(bitrixId)

      rowCount++
      
      if (isDryRun) {
        logger.info(`[DRY RUN] Row ${rowCount}: ${title} (ID: ${bitrixId})`)
        continue
      }

      // 1. Process Categories
      let lastCategoryId: string | null = null
      const catNames = [row[COL.CAT0], row[COL.CAT1], row[COL.CAT2]].filter(Boolean)
      
      for (const catName of catNames) {
        const normalizedCatName = catName.normalize('NFC')
        const existingCat = await payload.find({
          collection: 'categories',
          where: { title: { equals: normalizedCatName } },
          limit: 1,
          context: { disableRevalidate: true }
        })

        if (existingCat.docs.length > 0) {
          lastCategoryId = existingCat.docs[0].id as string
        } else {
          const catSlug = slugify(normalizedCatName, { lower: true, strict: true })
          const newCat = await payload.create({
            collection: 'categories',
            data: {
              title: normalizedCatName,
              slug: catSlug,
              parent: lastCategoryId
            },
            context: { disableRevalidate: true }
          })
          lastCategoryId = newCat.id as string
        }
      }

      // 2. Handle Image
      let mediaId: string | null = null
      const imagePath = row[COL.IMAGE]
      if (imagePath && imagePath.startsWith('/upload/')) {
        const imageUrl = `https://vsedlyavanny.kz${imagePath}`
        try {
            mediaId = await mediaUploader.uploadFromUrl(imageUrl, `product-${bitrixId}.jpg`, bitrixId)
        } catch (mediaErr: any) {
            logErrorToFile(`Media upload failed for product ID ${bitrixId}: ${mediaErr.message}`)
        }
      }
      
      // Fallback to placeholder if no image found (to satisfy minRows: 1 in Products collection)
      const placeholderId = 5199 
      let finalMediaId: string | number = mediaId || placeholderId

      // 3. Process Product
      const descriptionHtml = row[COL.DETAIL_TEXT] || ''
      const descriptionLexical = convertHtmlToLexical(descriptionHtml)
      const rawPrice = row[COL.PRICE] || '0'
      const sanitizedPrice = rawPrice.replace(/\s/g, '').replace(',', '.')
      let price = parseFloat(sanitizedPrice)
      if (isNaN(price)) price = 0

      // Extract and clean brand
      let brandName = row[4] || '' // IP_PROP130
      if (brandName) {
          brandName = brandName.replace(/\s*\(.*?\)\s*/g, '').trim()
      }

      // Robust slug generation
      const safeTitle = title.normalize('NFC').replace(/\//g, '-').replace(/\\/g, '-')
      const cleanSlugBase = slugify(safeTitle, { 
          lower: true, 
          strict: true, 
          remove: /[*+~.()'"!:@]/g 
      })
      const finalSlug = `${cleanSlugBase}-${bitrixId}`

      const productData: any = {
        title,
        bitrixId,
        slug: finalSlug,
        _status: 'published',
        categories: lastCategoryId ? [lastCategoryId] : [],
        description: descriptionLexical,
        priceInKZT: price,
        gallery: [{ image: finalMediaId }], // gallery is always populated now
        specs: brandName ? [{ key: 'Бренд', value: brandName }] : []
      }

      const existingProd = await payload.find({
        collection: 'products',
        where: { bitrixId: { equals: bitrixId } },
        limit: 1,
        context: { disableRevalidate: true }
      })

      if (existingProd.docs.length > 0) {
        await payload.update({
          collection: 'products',
          id: existingProd.docs[0].id,
          data: productData,
          context: { disableRevalidate: true }
        })
      } else {
        await payload.create({
          collection: 'products',
          data: productData,
          context: { disableRevalidate: true }
        })
      }

      successCount++
      consecutiveErrorCount = 0

      if (rowCount % 10 === 0) {
        logger.info(`Progress: ${rowCount} processed (${successCount} success, ${errorCount} errors)...`)
      }

    } catch (err: any) {
      errorCount++
      consecutiveErrorCount++
      const safeTitle = row[COL.NAME] ? row[COL.NAME].replace(/\//g, '-').replace(/\\/g, '-') : 'no-title'
      const bitrixId = row[COL.ID] || 'no-id'
      const finalSlug = `${slugify(safeTitle, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g })}-${bitrixId}`
      const errorMsg = `Row ${rowCount} (${row[COL.NAME]}) failed: ${err.message}. Slug: ${finalSlug}`
      logger.error(errorMsg)
      logErrorToFile(errorMsg)

      if (consecutiveErrorCount >= 100) {
        logger.error('Too many consecutive errors. Stopping.')
        break
      }
    }
  }

  logger.success(`Migration finished. Success: ${successCount}, Errors: ${errorCount}.`)
  process.exit(0)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
