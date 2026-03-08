import { BitrixClient } from '../bitrix'
import { MigrationLogger } from './logger'
import { MediaUploader } from './media-uploader'
import { convertHtmlToLexical } from './html-to-lexical'
import type { Payload } from 'payload'
import slugify from 'slugify'

export interface ProductServiceOptions {
  bitrix: BitrixClient
  logger: MigrationLogger
  mediaUploader: MediaUploader
  payload: Payload
}

export class ProductService {
  private bitrix: BitrixClient
  private logger: MigrationLogger
  private mediaUploader: MediaUploader
  private payload: Payload

  constructor(options: ProductServiceOptions) {
    this.bitrix = options.bitrix
    this.logger = options.logger
    this.mediaUploader = options.mediaUploader
    this.payload = options.payload
  }

  public async migrateProducts(limit: number = 0, isDryRun: boolean = false): Promise<void> {
    this.logger.info('Starting products migration...')
    
    const bitrixProducts = await this.fetchBitrixProducts(limit)
    
    if (bitrixProducts.length === 0) {
      this.logger.warn('No products found in Bitrix.')
      return
    }

    this.logger.info(`Found ${bitrixProducts.length} products to process.`)

    let createdCount = 0
    let updatedCount = 0
    let errorCount = 0

    for (const product of bitrixProducts) {
      try {
        const result = await this.processProduct(product, isDryRun)
        if (result === 'created') createdCount++
        else if (result === 'updated') updatedCount++
      } catch (error: any) {
        this.logger.error(`Failed to process product ID ${product.ID}: ${error.message}`)
        errorCount++
      }
    }

    this.logger.success('Products migration completed.', { createdCount, updatedCount, errorCount })
  }

  private async fetchBitrixProducts(limit: number): Promise<any[]> {
    const iblockId = process.env.BITRIX_IBLOCK_ID
    if (!iblockId) {
      throw new Error('BITRIX_IBLOCK_ID is not defined')
    }

    let allProducts: any[] = []
    let start = 0
    let hasMore = true
    const batchSize = 50

    while (hasMore) {
      this.logger.debug(`Fetching Bitrix products (start: ${start})...`)
      
      const response = await this.bitrix.callMethod<any[]>('catalog.product.list', {
        filter: { IBLOCK_ID: iblockId },
        select: ['ID', 'NAME', 'DETAIL_TEXT', 'DETAIL_PICTURE', 'IBLOCK_SECTION_ID', 'PRICE'],
        start,
      }).catch(err => {
          this.logger.warn('catalog.product.list failed, trying crm.product.list')
          return this.bitrix.callMethod<any[]>('crm.product.list', {
            filter: { CATALOG_ID: iblockId },
            select: ['ID', 'NAME', 'DESCRIPTION', 'PREVIEW_PICTURE', 'SECTION_ID', 'PRICE'],
            start,
          })
      })

      if (!response || response.length === 0) {
        hasMore = false
        break
      }

      allProducts = allProducts.concat(response)
      start += batchSize

      if (limit > 0 && allProducts.length >= limit) {
        allProducts = allProducts.slice(0, limit)
        hasMore = false
      }
      
      if (response.length < batchSize) {
        hasMore = false
      }
    }

    return allProducts
  }

  private async processProduct(product: any, isDryRun: boolean): Promise<'created' | 'updated' | 'skipped'> {
    const bitrixId = parseInt(product.ID, 10)
    const title = product.NAME
    
    if (isDryRun) {
      this.logger.info(`[DRY RUN] Would create/update product: ${title} (Bitrix ID: ${bitrixId})`)
      return 'skipped'
    }

    if (!this.payload) {
      throw new Error('Payload CMS instance is not initialized.')
    }

    // 1. Find existing product
    const existing = await this.payload.find({
      collection: 'products',
      where: { bitrixId: { equals: bitrixId } },
      limit: 1,
    })

    // 2. Map category
    const categoryIds: string[] = []
    const sectionId = product.IBLOCK_SECTION_ID || product.SECTION_ID
    if (sectionId) {
      const parentBitrixId = parseInt(sectionId, 10)
      const parentResult = await this.payload.find({
        collection: 'categories',
        where: { bitrixId: { equals: parentBitrixId } },
        limit: 1,
      })
      if (parentResult.docs.length > 0) {
        categoryIds.push(parentResult.docs[0].id)
      }
    }

    // 3. Handle image
    const pictureInfo = product.DETAIL_PICTURE || product.PREVIEW_PICTURE
    let mediaId: string | null = null
    if (pictureInfo) {
        let imageUrl = ''
        let fileId = bitrixId
        
        if (typeof pictureInfo === 'string') {
            imageUrl = pictureInfo.startsWith('http') ? pictureInfo : `${process.env.BITRIX_REST_URL?.split('/rest/')[0]}${pictureInfo}`
        } else if (pictureInfo.showUrl) {
            imageUrl = pictureInfo.showUrl.startsWith('http') ? pictureInfo.showUrl : `${process.env.BITRIX_REST_URL?.split('/rest/')[0]}${pictureInfo.showUrl}`
            fileId = parseInt(pictureInfo.id || bitrixId, 10)
        }

        if (imageUrl) {
            mediaId = await this.mediaUploader.uploadFromUrl(imageUrl, `product-${bitrixId}.jpg`, fileId, isDryRun)
        }
    }

    const descriptionHtml = product.DETAIL_TEXT || product.DESCRIPTION || ''
    const descriptionLexical = convertHtmlToLexical(descriptionHtml)

    const productData: any = {
      title,
      bitrixId,
      slug: slugify(title, { lower: true, strict: true }) + `-${bitrixId}`,
      _status: 'published',
      categories: categoryIds,
      description: descriptionLexical,
    }

    if (mediaId) {
      productData.gallery = [
        { image: mediaId }
      ]
    }

    if (existing.docs.length > 0) {
      await this.payload.update({
        collection: 'products',
        id: existing.docs[0].id,
        data: productData,
      })
      this.logger.debug(`Updated product: ${title}`)
      return 'updated'
    } else {
      await this.payload.create({
        collection: 'products',
        data: productData,
      })
      this.logger.debug(`Created product: ${title}`)
      return 'created'
    }
  }
}
