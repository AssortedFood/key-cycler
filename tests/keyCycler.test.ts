import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getKey, markKeyAsFailed, __resetCyclers__, debugState } from '../lib/keyCycler/index'

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

  it('cycles keys in round-robin order indefinitely', async () => {
    setEnv({
      ENV_TESTAPI_KEY1: 'one',
      ENV_TESTAPI_KEY2: 'two'
    })

    // Collect a sequence longer than the number of keys to verify rotation
    const sequence: string[] = []
    for (let i = 0; i < 6; i++) {
      sequence.push(await getKey('testapi'))
    }

    // Expect alternating 'one', 'two', 'one', ...
    expect(sequence).toEqual([
      'one', 'two', 'one', 'two', 'one', 'two'
    ])
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

    // Initial rotation should yield both 'good' and 'bad'
    const first = await getKey('testapi')
    const second = await getKey('testapi')
    expect(new Set([first, second])).toEqual(new Set(['good', 'bad']))

    // Expire 'bad' manually
    markKeyAsFailed('testapi', 'bad')

    // Subsequent calls should always return 'good'
    expect(await getKey('testapi')).toBe('good')
    expect(await getKey('testapi')).toBe('good')
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
  
  it('debugState returns correct pointer, usage and failed flags', async () => {
    setEnv({
      ENV_TESTAPI_KEY1: 'x',
      ENV_TESTAPI_KEY2: 'y'
    })
    __resetCyclers__()
    // Initialize and consume one key
    const firstKey = await getKey('testapi')
    expect(firstKey).toBe('x')
    const state1 = debugState('testapi')
    expect(state1).toEqual({
      pointer: 1,
      keys: [
        { value: 'x', usage: 1, failed: false },
        { value: 'y', usage: 0, failed: false }
      ]
    })
    // Mark first key as failed
    markKeyAsFailed('testapi', 'x')
    const state2 = debugState('testapi')
    expect(state2.keys[0].failed).toBe(true)
  })
})
