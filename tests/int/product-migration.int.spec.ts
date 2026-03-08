import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProductService } from '../../src/lib/migration/product-service'
import { BitrixClient } from '../../src/lib/bitrix'
import { MigrationLogger } from '../../src/lib/migration/logger'
import { MediaUploader } from '../../src/lib/migration/media-uploader'

// Mock dependencies
vi.mock('../../src/lib/bitrix', () => {
  return {
    BitrixClient: class {
      callMethod = vi.fn()
    }
  }
})

vi.mock('../../src/lib/migration/media-uploader', () => {
  return {
    MediaUploader: class {
      uploadFromUrl = vi.fn().mockResolvedValue('mock-media-id')
    }
  }
})

describe('ProductService Migration', () => {
  let logger: MigrationLogger
  let bitrix: any
  let mediaUploader: any

  beforeEach(() => {
    logger = new MigrationLogger(true)
    bitrix = new BitrixClient({ restUrl: 'http://test', logger })
    mediaUploader = new MediaUploader({ logger })
    vi.clearAllMocks()
    process.env.BITRIX_IBLOCK_ID = '14'
  })

  it('should fetch products and process them (dry run)', async () => {
    const mockProducts = [
      { 
        ID: '101', 
        NAME: 'Product 1', 
        DETAIL_TEXT: '<p>Desc</p>', 
        IBLOCK_SECTION_ID: '1',
        DETAIL_PICTURE: { showUrl: '/img.jpg' }
      },
      { 
        ID: '102', 
        NAME: 'Product 2', 
        DETAIL_TEXT: null, 
        IBLOCK_SECTION_ID: '2',
        DETAIL_PICTURE: null
      },
    ]

    bitrix.callMethod.mockResolvedValueOnce(mockProducts)
    bitrix.callMethod.mockResolvedValueOnce([]) // End of pagination

    const service = new ProductService({ bitrix, logger, mediaUploader })
    
    const spyInfo = vi.spyOn(logger, 'info')
    
    await service.migrateProducts(0, true)

    expect(bitrix.callMethod).toHaveBeenCalledTimes(1) // Stop because length < batchSize
    expect(spyInfo).toHaveBeenCalledWith(expect.stringContaining('Product 1 (Bitrix ID: 101)'))
    expect(spyInfo).toHaveBeenCalledWith(expect.stringContaining('Product 2 (Bitrix ID: 102)'))
  })
})
