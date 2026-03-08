import { put } from '@vercel/blob'
import { MigrationLogger } from './logger'
import type { Payload } from 'payload'

export interface MediaUploaderOptions {
  logger: MigrationLogger
  payload: Payload
}

export class MediaUploader {
  private logger: MigrationLogger
  private payload: Payload

  constructor(options: MediaUploaderOptions) {
    this.logger = options.logger
    this.payload = options.payload
  }

  /**
   * Uploads an image from a URL to Vercel Blob and creates a Payload Media record
   * @param imageUrl The full URL to the image on Bitrix
   * @param filename Desired filename for the blob
   * @param bitrixId Original ID from Bitrix for deduplication
   * @param isDryRun
   * @returns The created Media ID or null if failed
   */
  public async uploadFromUrl(imageUrl: string, filename: string, bitrixId: number, isDryRun: boolean = false): Promise<string | null> {
    try {
      if (!isDryRun && !this.payload) {
        throw new Error('Payload CMS instance is not initialized.')
      }

      // 1. Check if already exists in Payload
      if (!isDryRun) {
        const existing = await this.payload.find({
          collection: 'media',
          where: { bitrixId: { equals: bitrixId } },
          limit: 1,
        })

        if (existing.docs.length > 0) {
          this.logger.debug(`Media already exists for bitrixId: ${bitrixId}`)
          return existing.docs[0].id
        }
      } else {
        this.logger.debug(`[DRY RUN] Checking if media exists for bitrixId: ${bitrixId}`)
      }

      // 2. Download the image
      this.logger.debug(`Downloading image from ${imageUrl}`)
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`)
      }
      
      const buffer = await response.arrayBuffer()
      const mimeType = response.headers.get('content-type') || 'image/jpeg'

      // 3. Upload to Vercel Blob (if not dry run)
      if (isDryRun) {
        this.logger.info(`[DRY RUN] Would upload ${filename} to Vercel Blob and create Media record`)
        return 'mock-media-id'
      }

      // Assuming Payload uses @payloadcms/storage-vercel-blob, we just create the record with the file data
      // Payload will automatically upload it to the blob storage via the plugin
      const createdMedia = await this.payload.create({
        collection: 'media',
        data: {
          alt: filename,
          bitrixId,
        },
        file: {
          data: Buffer.from(buffer),
          mimetype: mimeType,
          name: filename,
          size: buffer.byteLength,
        },
      })

      this.logger.debug(`Successfully created media record with ID: ${createdMedia.id}`)
      return createdMedia.id

    } catch (error: any) {
      this.logger.error(`Failed to upload media ${imageUrl}: ${error.message}`)
      return null
    }
  }
}
