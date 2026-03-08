export class MigrationLogger {
  private isDryRun: boolean

  constructor(isDryRun: boolean = false) {
    this.isDryRun = isDryRun
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString()
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : ''
    const dryRunPrefix = this.isDryRun ? '[DRY RUN] ' : ''
    return `${timestamp} [${level}] ${dryRunPrefix}${message}${metaStr}`
  }

  info(message: string, meta?: any) {
    console.log(`\x1b[36m${this.formatMessage('INFO', message, meta)}\x1b[0m`)
  }

  success(message: string, meta?: any) {
    console.log(`\x1b[32m${this.formatMessage('SUCCESS', message, meta)}\x1b[0m`)
  }

  warn(message: string, meta?: any) {
    console.warn(`\x1b[33m${this.formatMessage('WARN', message, meta)}\x1b[0m`)
  }

  error(message: string, meta?: any) {
    console.error(`\x1b[31m${this.formatMessage('ERROR', message, meta)}\x1b[0m`)
  }

  debug(message: string, meta?: any) {
    if (process.env.DEBUG === 'true') {
      console.log(`\x1b[90m${this.formatMessage('DEBUG', message, meta)}\x1b[0m`)
    }
  }
}
