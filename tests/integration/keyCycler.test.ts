import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import axios from 'axios';
import { getKey, markKeyAsFailed, __resetCyclers__ } from '../../src/index';
import { startMockServer, stopMockServer, resetKeyUsage } from '../../mock/fakeApiServer';
import { loadFakeApiKeys } from './loadFakeKeys';

process.env.ENV_FAKEAPI_KEY1 = 'fakeKey1';
process.env.ENV_FAKEAPI_KEY2 = 'fakeKey2';
const fakeKeys = loadFakeApiKeys();
const BASE_URL = 'http://localhost:3000';

let server: any;
beforeAll(async () => { resetKeyUsage(); __resetCyclers__(); server = await startMockServer(3000, 2); });
afterAll(async () => { await stopMockServer(); });
beforeEach(() => { resetKeyUsage(); __resetCyclers__(); });

describe('Integration: Key Cycler & Mock API', () => {
  it('automatically cycles through all keys until exhaustion and respects server rate limits', async () => {
    // With RATE_LIMIT = 2, expect each key to succeed twice before a rate limit error
    const totalCalls = fakeKeys.length * 2;
    for (let i = 0; i < totalCalls; i++) {
      const key = await getKey('fakeapi');
      expect(fakeKeys).toContain(key);
      const res = await axios.post(
        `${BASE_URL}/speak`,
        { text: 'Hello' },
        { headers: { 'xi-api-key': key } }
      );
      expect(res.status).toBe(200);
    }
    // Next call for the first key should be rate-limited (429)
    const nextKey = await getKey('fakeapi');
    await expect(
      axios.post(
        `${BASE_URL}/speak`,
        { text: 'Hello' },
        { headers: { 'xi-api-key': nextKey } }
      )
    ).rejects.toMatchObject({ response: { status: 429 } });
  });
  it('rotates to next key upon manual markKeyAsFailed after server 429', async () => {
    // Exhaust first key by hitting server limit (2)
    for (let i = 1; i <= 2; i++) {
      const res = await axios.post(
        `${BASE_URL}/speak`,
        { text: 'Hello' },
        { headers: { 'xi-api-key': fakeKeys[0] } }
      );
      expect(res.status).toBe(200);
    }
    // Next call should be rate-limited (429)
    await expect(
      axios.post(
        `${BASE_URL}/speak`,
        { text: 'Hello' },
        { headers: { 'xi-api-key': fakeKeys[0] } }
      )
    ).rejects.toMatchObject({ response: { status: 429 } });
    const key0 = await getKey('fakeapi'); expect(key0).toBe(fakeKeys[0]); markKeyAsFailed('fakeapi', key0);
    const key1 = await getKey('fakeapi'); expect(key1).toBe(fakeKeys[1]);
    const res = await axios.post(`${BASE_URL}/speak`, { text: 'Hello' }, { headers: { 'xi-api-key': key1 } }); expect(res.status).toBe(200);
  });
  it('errors after all keys are manually marked failed following server exhaustion', async () => {
    // Initialize client cycler for marking failures
    await getKey('fakeapi');
    for (const key of fakeKeys) {
      // Exhaust each key on the server side (2 usages)
      for (let i = 1; i <= 2; i++) {
        const res = await axios.post(
          `${BASE_URL}/speak`,
          { text: 'Hello' },
          { headers: { 'xi-api-key': key } }
        );
        expect(res.status).toBe(200);
      }
      await expect(
        axios.post(
          `${BASE_URL}/speak`,
          { text: 'Hello' },
          { headers: { 'xi-api-key': key } }
        )
      ).rejects.toMatchObject({ response: { status: 429 } });
      // Mark as failed in the cycler
      markKeyAsFailed('fakeapi', key);
    }
    // Expect cycler to throw when no keys remain
    await expect(getKey('fakeapi')).rejects.toThrow('All API keys for fakeapi are exhausted');
  });
  
  it('automatically handles server 429 by marking key as failed and rotates keys', async () => {
    // Wrapper: on 429, mark key as failed and retry with next key
    const speak = async (text: string) => {
      const key = await getKey('fakeapi');
      try {
        const res = await axios.post(
          `${BASE_URL}/speak`,
          { text },
          { headers: { 'xi-api-key': key } }
        );
        return { key, res };
      } catch (err: any) {
        if (err.response?.status === 429) {
          markKeyAsFailed('fakeapi', key);
          const nextKey = await getKey('fakeapi');
          const res = await axios.post(
            `${BASE_URL}/speak`,
            { text },
            { headers: { 'xi-api-key': nextKey } }
          );
          return { key: nextKey, res };
        }
        throw err;
      }
    };
    // Two usages per key: first key should succeed twice
    const result1 = await speak('Hello');
    expect(result1.key).toBe(fakeKeys[0]);
    expect(result1.res.status).toBe(200);
    const result2 = await speak('Hello');
    expect(result2.key).toBe(fakeKeys[0]);
    expect(result2.res.status).toBe(200);
    // Third call triggers 429, wrapper rotates to next key
    const result3 = await speak('Hello');
    expect(result3.key).toBe(fakeKeys[1]);
    expect(result3.res.status).toBe(200);
  });
});