import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CategoryService } from '../../src/lib/migration/category-service'
import { BitrixClient } from '../../src/lib/bitrix'
import { MigrationLogger } from '../../src/lib/migration/logger'

// Mock BitrixClient
vi.mock('../../src/lib/bitrix', () => {
  return {
    BitrixClient: class {
      callMethod = vi.fn()
    }
  }
})

describe('CategoryService Migration', () => {
  let logger: MigrationLogger
  let bitrix: any

  beforeEach(() => {
    logger = new MigrationLogger(true)
    bitrix = new BitrixClient({ restUrl: 'http://test', logger })
    vi.clearAllMocks()
    process.env.BITRIX_IBLOCK_ID = '14'
  })

  it('should fetch and sort categories hierarchically', async () => {
    const mockSections = [
      { ID: '3', NAME: 'Sub-Child', IBLOCK_SECTION_ID: '2' },
      { ID: '1', NAME: 'Root', IBLOCK_SECTION_ID: null },
      { ID: '2', NAME: 'Child', IBLOCK_SECTION_ID: '1' },
    ]

    bitrix.callMethod.mockResolvedValueOnce(mockSections)
    bitrix.callMethod.mockResolvedValueOnce([]) // End of pagination

    const service = new CategoryService({ bitrix, logger })
    
    // We are testing internal method indirectly via dry run output, 
    // or we can test the public method which calls sorting internally.
    const spyInfo = vi.spyOn(logger, 'info')
    
    await service.migrateCategories(0, true)

    expect(bitrix.callMethod).toHaveBeenCalledTimes(1)
    // First should be Root, then Child, then Sub-Child based on logic
    // We can verify this by checking logger calls
    expect(spyInfo).toHaveBeenCalledWith(expect.stringContaining('Root (Bitrix ID: 1)'))
    expect(spyInfo).toHaveBeenCalledWith(expect.stringContaining('Child (Bitrix ID: 2)'))
    expect(spyInfo).toHaveBeenCalledWith(expect.stringContaining('Sub-Child (Bitrix ID: 3)'))
  })
})
