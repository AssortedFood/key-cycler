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
  it('automatically cycles through all keys until exhaustion', async () => {
    for (let i = 0; i < fakeKeys.length; i++) {
      const key = await getKey('fakeapi');
      expect(fakeKeys).toContain(key);
      const res = await axios.post(`${BASE_URL}/speak`, { text: 'Hello' }, { headers: { 'xi-api-key': key } });
      expect(res.status).toBe(200);
    }
    // No further getKey call: exhaustion handled via markKeyAsFailed and server 429
  });
  it('rotates to next key upon manual markKeyAsFailed after server 429', async () => {
    // Exhaust first key by hitting server limit (default 5)
    for (let i = 1; i <= 5; i++) {
      await axios.post(`${BASE_URL}/speak`, { text: 'Hello' }, { headers: { 'xi-api-key': fakeKeys[0] } });
    }
    // Next call should be rate-limited (429)
    await expect(
      axios.post(`${BASE_URL}/speak`, { text: 'Hello' }, { headers: { 'xi-api-key': fakeKeys[0] } })
    ).rejects.toMatchObject({ response: { status: 429 } });
    const key0 = await getKey('fakeapi'); expect(key0).toBe(fakeKeys[0]); markKeyAsFailed('fakeapi', key0);
    const key1 = await getKey('fakeapi'); expect(key1).toBe(fakeKeys[1]);
    const res = await axios.post(`${BASE_URL}/speak`, { text: 'Hello' }, { headers: { 'xi-api-key': key1 } }); expect(res.status).toBe(200);
  });
  it('errors after all keys are manually marked failed following server exhaustion', async () => {
    // Initialize client cycler for marking failures
    await getKey('fakeapi');
    for (const key of fakeKeys) {
      // Exhaust each key on the server side
      for (let i = 1; i <= 5; i++) {
        await axios.post(`${BASE_URL}/speak`, { text: 'Hello' }, { headers: { 'xi-api-key': key } });
      }
      await expect(
        axios.post(`${BASE_URL}/speak`, { text: 'Hello' }, { headers: { 'xi-api-key': key } })
      ).rejects.toMatchObject({ response: { status: 429 } });
      // Mark as failed in the cycler
      markKeyAsFailed('fakeapi', key);
    }
    // Expect cycler to throw when no keys remain
    await expect(getKey('fakeapi')).rejects.toThrow('All API keys for fakeapi are exhausted');
  });
});