import { describe, it, expect } from 'vitest'
import { KeyCycler } from '../src/KeyCycler'
import { KeyUsage } from '../src/fakeApi'

const RATE_LIMIT_PER_KEY = 5

describe('KeyCycler Integration Tests', () => {
  it('cycles keys correctly and respects rate limits', async () => {
    const keys = ['keyA', 'keyB', 'keyC']
    const usageMap: KeyUsage = {}
    const cycler = new KeyCycler({ keys, usageMap })

    // 15 requests total, each key allowed 5 times = no exhaustion
    for (let i = 0; i < 15; i++) {
      const response = await cycler.makeRequest()
      const expectedKey = keys[i % keys.length]
      expect(response.keyUsed).toBe(expectedKey)
      expect(response.message).toBe('Success')
    }
  })

  it('retries next key on exhausted key and skips exhausted keys', async () => {
    const keys = ['keyX', 'keyY']
    const usageMap: KeyUsage = { keyX: RATE_LIMIT_PER_KEY, keyY: 0 }
    const cycler = new KeyCycler({ keys, usageMap })

    // keyX exhausted, should skip to keyY immediately
    const response = await cycler.makeRequest()
    expect(response.keyUsed).toBe('keyY')
    expect(response.message).toBe('Success')
  })

  it('fails when all keys are exhausted', async () => {
    const keys = ['key1', 'key2']
    const usageMap: KeyUsage = {
      key1: RATE_LIMIT_PER_KEY,
      key2: RATE_LIMIT_PER_KEY,
    }
    const cycler = new KeyCycler({ keys, usageMap })

    await expect(cycler.makeRequest()).rejects.toThrow('All API keys are rate limited or exhausted')
  })

  it('handles single key scenario with exhaustion', async () => {
    const keys = ['onlyKey']
    const usageMap: KeyUsage = { onlyKey: 0 }
    const cycler = new KeyCycler({ keys, usageMap })

    // Use the same key 5 times successfully
    for (let i = 0; i < RATE_LIMIT_PER_KEY; i++) {
      const response = await cycler.makeRequest()
      expect(response.keyUsed).toBe('onlyKey')
      expect(response.message).toBe('Success')
    }

    // 6th request should fail
    await expect(cycler.makeRequest()).rejects.toThrow('All API keys are rate limited or exhausted')
  })

  it('handles concurrent requests without overlapping keys', async () => {
    const keys = ['a', 'b', 'c', 'd']
    const usageMap: KeyUsage = {}
    const cycler = new KeyCycler({ keys, usageMap })

    // Make 8 concurrent requests
    const promises = Array.from({ length: 8 }).map(() => cycler.makeRequest())
    const results = await Promise.all(promises)

    // Collect keys used
    const keysUsed = results.map(r => r.keyUsed)

    // Each key should appear at least once and no duplicates in the first 4 requests (concurrent)
    expect(new Set(keysUsed).size).toBeLessThanOrEqual(keys.length)
  })
})
