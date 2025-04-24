import type { KeyUsage } from './fakeApi'
import { fakeApiRequest } from './fakeApi'

export interface KeyCyclerOptions {
  keys: string[]
  usageMap: KeyUsage // To track usage counts, passed externally to share with fakeApi
}

export class KeyCycler {
  private keys: string[]
  private usageMap: KeyUsage
  private currentIndex: number

  constructor(options: KeyCyclerOptions) {
    if (!options.keys || options.keys.length === 0) {
      throw new Error('At least one API key must be provided')
    }
    this.keys = options.keys
    this.usageMap = options.usageMap
    this.currentIndex = 0
  }

  private getNextKey(): string {
    const key = this.keys[this.currentIndex]
    this.currentIndex = (this.currentIndex + 1) % this.keys.length
    return key
  }

  async makeRequest(): Promise<{ keyUsed: string; message: string }> {
    const totalKeys = this.keys.length
    let attempts = 0

    while (attempts < totalKeys) {
      const key = this.getNextKey()
      try {
        const result = await fakeApiRequest(key, this.usageMap)
        return result
      } catch (err: any) {
        if (err.message && err.message.includes('Rate limit exceeded')) {
          attempts++
          // try next key
          continue
        }
        // rethrow other errors
        throw err
      }
    }
    throw new Error('All API keys are rate limited or exhausted')
  }
}
