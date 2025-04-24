import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getKey, markKeyAsFailed, __resetCyclers__ } from '../lib/keyCycler/index'

// Helper to set environment variables
function setEnv(keys: Record<string, string>) {
  for (const [k, v] of Object.entries(keys)) {
    process.env[k] = v
  }
}

// Helper to clear specific env keys
function clearEnv(prefix: string) {
  Object.keys(process.env)
    .filter((k) => k.startsWith(prefix))
    .forEach((k) => delete process.env[k])
}

describe('KeyCycler', () => {
  const ENV_PREFIX = 'ENV_TESTAPI_KEY'

  beforeEach(() => {
    clearEnv(ENV_PREFIX)
    __resetCyclers__() // ensure cyclers state is clean
    vi.resetModules()
  })

  it('loads and rotates through available keys in order', async () => {
    setEnv({
      ENV_TESTAPI_KEY1: 'alpha',
      ENV_TESTAPI_KEY2: 'bravo',
      ENV_TESTAPI_KEY3: 'charlie'
    })

    expect(await getKey('testapi')).toBe('alpha')
    expect(await getKey('testapi')).toBe('bravo')
    expect(await getKey('testapi')).toBe('charlie')
    expect(await getKey('testapi')).toBe('alpha')
    expect(await getKey('testapi')).toBe('bravo')
  })

  it('respects rate limits and skips exhausted keys', async () => {
    setEnv({
      ENV_TESTAPI_KEY1: 'one',
      ENV_TESTAPI_KEY2: 'two'
    })
  
    // Exhaust 'one' by tracking exact usage
    const used: string[] = []
    for (let i = 0; i < 10; i++) {
      try {
        used.push(await getKey('testapi'))
      } catch {
        break
      }
    }
  
    const oneUsage = used.filter(k => k === 'one').length
    const twoUsage = used.filter(k => k === 'two').length
  
    expect(oneUsage).toBe(5)
    expect(twoUsage).toBeLessThanOrEqual(5)
    expect(oneUsage + twoUsage).toBeLessThanOrEqual(10)
  })
  

  it('throws an error when all keys are exhausted', async () => {
    setEnv({
      ENV_TESTAPI_KEY1: 'dead',
      ENV_TESTAPI_KEY2: 'gone'
    })

    // Exhaust both
    for (let i = 0; i < 10; i++) {
      await getKey('testapi')
    }

    await expect(getKey('testapi')).rejects.toThrow(
      'All API keys for testapi are rate-limited'
    )
  })

  it('markKeyAsFailed manually expires a key early', async () => {
    setEnv({
      ENV_TESTAPI_KEY1: 'good',
      ENV_TESTAPI_KEY2: 'bad'
    })
  
    const first = await getKey('testapi') // good
    const second = await getKey('testapi') // bad
  
    expect(new Set([first, second])).toEqual(new Set(['good', 'bad']))
  
    // Simulate failure on 'bad' immediately
    markKeyAsFailed('testapi', 'bad')
  
    // 'good' should now be the only key used until exhausted
    for (let i = 0; i < 4; i++) {
      const key = await getKey('testapi')
      expect(key).toBe('good')
    }
  
    // One more call should exhaust 'good' too
    await expect(getKey('testapi')).rejects.toThrow(
      'All API keys for testapi are rate-limited'
    )
  })

  it('throws if no keys exist in the environment', async () => {
    clearEnv(ENV_PREFIX)

    await expect(getKey('testapi')).rejects.toThrow(
      'No keys found for testapi'
    )
  })

  it('can interleave multiple APIs without conflict', async () => {
    setEnv({
      ENV_APIONE_KEY1: 'a1',
      ENV_APIONE_KEY2: 'a2',
      ENV_APITWO_KEY1: 'b1'
    })

    expect(await getKey('apione')).toBe('a1')
    expect(await getKey('apitwo')).toBe('b1')
    expect(await getKey('apione')).toBe('a2')
    expect(await getKey('apitwo')).toBe('b1')
  })
})
