import fetch from 'cross-fetch'
import { MigrationLogger } from './logger'

export interface BitrixClientOptions {
  restUrl: string
  logger: MigrationLogger
}

export interface BitrixResponse<T> {
  result: T
  total?: number
  next?: number
  error?: string
  error_description?: string
}

export class BitrixClient {
  private restUrl: string
  private logger: MigrationLogger

  constructor(options: BitrixClientOptions) {
    if (!options.restUrl) {
      throw new Error('BITRIX_REST_URL is not defined in environment variables')
    }
    // Ensure URL ends with a slash
    this.restUrl = options.restUrl.endsWith('/') ? options.restUrl : `${options.restUrl}/`
    this.logger = options.logger
  }

  /**
   * Execute an API method with automatic retries and error handling
   */
  public async callMethod<T>(method: string, params: Record<string, any> = {}, retryCount = 3): Promise<T> {
    const url = `${this.restUrl}${method}`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000) // 30 seconds timeout

    try {
      this.logger.debug(`Calling Bitrix API: ${method}`, { params })
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = (await response.json()) as BitrixResponse<T>

      if (data.error) {
        throw new Error(`Bitrix API Error: ${data.error_description || data.error}`)
      }

      return data.result
    } catch (error: any) {
      this.logger.error(`Error calling ${method}: ${error.message}`)
      
      if (retryCount > 0) {
        this.logger.warn(`Retrying ${method}... (${retryCount} attempts left)`)
        await new Promise((resolve) => setTimeout(resolve, 2000)) // 2 sec delay before retry
        return this.callMethod<T>(method, params, retryCount - 1)
      }
      
      throw error
    } finally {
      clearTimeout(timeout)
    }
  }

  /**
   * Method for US1: Check connection by calling a safe method (e.g., getting server time or profile info)
   */
  public async checkConnection(): Promise<{ connected: boolean; version?: string; error?: string }> {
    try {
      // app.info is commonly available and safe to call
      const result = await this.callMethod<any>('app.info')
      this.logger.info('Successfully connected to Bitrix REST API', { version: result.VERSION })
      return { connected: true, version: result.VERSION }
    } catch (error: any) {
      this.logger.error('Failed to connect to Bitrix', { error: error.message })
      return { connected: false, error: error.message }
    }
  }
}
