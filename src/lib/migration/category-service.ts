import { BitrixClient } from '../bitrix'
import { MigrationLogger } from './logger'
import type { Payload } from 'payload'

export interface CategoryServiceOptions {
  bitrix: BitrixClient
  logger: MigrationLogger
  payload: Payload
}

export class CategoryService {
  private bitrix: BitrixClient
  private logger: MigrationLogger
  private payload: Payload

  constructor(options: CategoryServiceOptions) {
    this.bitrix = options.bitrix
    this.logger = options.logger
    this.payload = options.payload
  }

  /**
   * Main entry point for category migration
   */
  public async migrateCategories(limit: number = 0, isDryRun: boolean = false): Promise<void> {
    this.logger.info('Starting categories migration...')
    
    // 1. Fetch categories from Bitrix
    const bitrixSections = await this.fetchBitrixSections(limit)
    
    if (bitrixSections.length === 0) {
      this.logger.warn('No categories found in Bitrix.')
      return
    }

    this.logger.info(`Found ${bitrixSections.length} categories to process.`)

    // 2. Sort to ensure parents are created before children
    const sortedSections = this.sortSectionsHierarchically(bitrixSections)

    // 3. Process each category
    let createdCount = 0
    let updatedCount = 0
    let errorCount = 0

    for (const section of sortedSections) {
      try {
        const result = await this.processCategory(section, isDryRun)
        if (result === 'created') createdCount++
        else if (result === 'updated') updatedCount++
      } catch (error: any) {
        this.logger.error(`Failed to process category ID ${section.ID}: ${error.message}`)
        errorCount++
      }
    }

    this.logger.success('Categories migration completed.', { createdCount, updatedCount, errorCount })
  }

  /**
   * Fetches all sections from Bitrix IBLOCK
   */
  private async fetchBitrixSections(limit: number): Promise<any[]> {
    const iblockId = process.env.BITRIX_IBLOCK_ID
    if (!iblockId) {
      throw new Error('BITRIX_IBLOCK_ID is not defined')
    }

    let allSections: any[] = []
    let start = 0
    let hasMore = true
    const batchSize = 50

    while (hasMore) {
      this.logger.debug(`Fetching Bitrix sections (start: ${start})...`)
      
      const response = await this.bitrix.callMethod<any[]>('catalog.section.list', {
        filter: { IBLOCK_ID: iblockId },
        select: ['ID', 'NAME', 'IBLOCK_SECTION_ID', 'PICTURE'],
        start,
      })

      if (!response || response.length === 0) {
        hasMore = false
        break
      }

      allSections = allSections.concat(response)
      start += batchSize

      if (limit > 0 && allSections.length >= limit) {
        allSections = allSections.slice(0, limit)
        hasMore = false
      }
      
      // Stop if response is less than batch size (end of list)
      if (response.length < batchSize) {
        hasMore = false
      }
    }

    return allSections
  }

  /**
   * Sorts sections so that parent sections come before their children
   */
  private sortSectionsHierarchically(sections: any[]): any[] {
    const sorted: any[] = []
    const visited = new Set<string>()

    const visit = (sectionId: string) => {
      if (visited.has(sectionId)) return

      const section = sections.find(s => s.ID === sectionId)
      if (!section) return

      if (section.IBLOCK_SECTION_ID) {
        visit(section.IBLOCK_SECTION_ID)
      }

      visited.add(sectionId)
      sorted.push(section)
    }

    sections.forEach(s => visit(s.ID))
    return sorted
  }

  /**
   * Processes a single Bitrix section into a Payload category
   */
  private async processCategory(section: any, isDryRun: boolean): Promise<'created' | 'updated' | 'skipped'> {
    const bitrixId = parseInt(section.ID, 10)
    
    if (isDryRun) {
      this.logger.info(`[DRY RUN] Would create/update category: ${section.NAME} (Bitrix ID: ${bitrixId})`)
      if (section.IBLOCK_SECTION_ID) {
        this.logger.debug(`  └─ Parent Bitrix ID: ${section.IBLOCK_SECTION_ID}`)
      }
      return 'skipped'
    }

    if (!this.payload) {
        throw new Error('Payload CMS instance is not initialized.')
    }

    // Check if category already exists in Payload
    const existing = await this.payload.find({
      collection: 'categories',
      where: {
        bitrixId: { equals: bitrixId }
      },
      limit: 1,
    })

    let parentId = null
    if (section.IBLOCK_SECTION_ID) {
      const parentBitrixId = parseInt(section.IBLOCK_SECTION_ID, 10)
      const parentResult = await this.payload.find({
        collection: 'categories',
        where: { bitrixId: { equals: parentBitrixId } },
        limit: 1,
      })
      if (parentResult.docs.length > 0) {
        parentId = parentResult.docs[0].id
      } else {
        this.logger.warn(`Parent category (Bitrix ID: ${parentBitrixId}) not found for section ${section.NAME}`)
      }
    }

    const categoryData: any = {
      title: section.NAME,
      bitrixId,
      ...(parentId ? { parent: parentId } : {})
    }

    if (existing.docs.length > 0) {
      // Update existing
      const id = existing.docs[0].id
      await this.payload.update({
        collection: 'categories',
        id,
        data: categoryData,
      })
      this.logger.debug(`Updated category: ${section.NAME}`)
      return 'updated'
    } else {
      // Create new
      await this.payload.create({
        collection: 'categories',
        data: categoryData,
      })
      this.logger.debug(`Created category: ${section.NAME}`)
      return 'created'
    }
  }
}
