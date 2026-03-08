import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BitrixClient } from '../../src/lib/bitrix'
import { MigrationLogger } from '../../src/lib/migration/logger'

// Mock cross-fetch
vi.mock('cross-fetch', () => {
  return {
    default: vi.fn(),
  }
})

import fetch from 'cross-fetch'

describe('BitrixClient Connection', () => {
  let logger: MigrationLogger

  beforeEach(() => {
    logger = new MigrationLogger(true)
    vi.clearAllMocks()
  })

  it('should successfully connect when app.info returns valid data', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        result: { VERSION: '1.0.0' }
      })
    };
    (fetch as any).mockResolvedValue(mockResponse)

    const client = new BitrixClient({ restUrl: 'https://test.bitrix24.com/rest/1/abc', logger })
    const result = await client.checkConnection()

    expect(result.connected).toBe(true)
    expect(result.version).toBe('1.0.0')
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith('https://test.bitrix24.com/rest/1/abc/app.info', expect.any(Object))
  })

  it('should fail connection when API returns an error', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        error: 'expired_token',
        error_description: 'The access token provided has expired.'
      })
    };
    (fetch as any).mockResolvedValue(mockResponse)

    const client = new BitrixClient({ restUrl: 'https://test.bitrix24.com/rest/1/abc', logger })
    const result = await client.checkConnection()

    expect(result.connected).toBe(false)
    expect(result.error).toContain('access token provided has expired')
  })
})
