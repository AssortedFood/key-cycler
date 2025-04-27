import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

// Setup fake API keys for integration tests
process.env.ENV_FAKEAPI_KEY1 = 'fakeKey1';
process.env.ENV_FAKEAPI_KEY2 = 'fakeKey2';

import { getKey, markKeyAsFailed, __resetCyclers__ } from '../../src/index';
import { startMockServer, stopMockServer, resetKeyUsage } from '../../mock/fakeApiServer';
import axios from 'axios';
import { loadFakeApiKeys } from './loadFakeKeys';

const BASE_URL = 'http://localhost:4000';
const RATE_LIMIT = 5;
const fakeKeys = loadFakeApiKeys();

describe('Key Cycler integration tests', () => {
  beforeAll(async () => {
    // Ensure server and client state are reset
    resetKeyUsage();
    __resetCyclers__();
  });

  beforeEach(() => {
    // Reset cycler pointer before each test if needed
    __resetCyclers__();
  });

  it('should cycle through keys and handle rate limits', async () => {
    // Retrieve first API key from cycler
    const key1 = await getKey('fakeapi');
    expect(fakeKeys).toContain(key1);

    // Exhaust key1 on the server side
    for (let i = 1; i <= RATE_LIMIT; i++) {
      const res = await axios.post(
        BASE_URL + '/speak',
        { text: 'Hello' },
        { headers: { 'xi-api-key': key1 } }
      );
      expect(res.status).toBe(200);
    }

    // Next server call for key1 should be rate limited
    await expect(
      axios.post(
        BASE_URL + '/speak',
        { text: 'Hello' },
        { headers: { 'xi-api-key': key1 } }
      )
    ).rejects.toMatchObject({ response: { status: 429 } });

    // Inform cycler that key1 has failed
    markKeyAsFailed('fakeapi', key1);

    // Next call to getKey() should return a different key
    const key2 = await getKey('fakeapi');
    expect(key2).not.toBe(key1);
    expect(fakeKeys).toContain(key2);
  });
});

import { loadFakeApiKeys } from './loadFakeKeys';

const fakeKeys = loadFakeApiKeys();

// Example usage to verify keys loaded
console.log('Loaded fake API keys:', fakeKeys);

import { startMockServer, stopMockServer } from '../../mock/fakeApiServer';

let server;

beforeAll(async () => {
  server = await startMockServer(4000);
});

afterAll(async () => {
  await stopMockServer();
});

import axios from 'axios';

const BASE_URL = 'http://localhost:4000';
const RATE_LIMIT = 5;

describe('POST /speak rate limit handling', () => {
  it('should return 200 until rate limit exceeded and then 429', async () => {
    for (const key of fakeKeys) {
      for (let i = 1; i <= RATE_LIMIT; i++) {
        const response = await axios.post(
          BASE_URL + '/speak',
          { text: 'Hello' },
          { headers: { 'xi-api-key': key } }
        );
        expect(response.status).toBe(200);
      }

      // Next request should be rate limited
      try {
        await axios.post(BASE_URL + '/speak', { text: 'Hello' }, { headers: { 'xi-api-key': key } });
        throw new Error('Expected 429 but did not get');
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          expect(err.response.status).toBe(429);
        } else {
          throw err;
        }
      }
    }
  });
});

describe('Key cycler full exhaustion behavior', () => {
  it('should handle all keys exhausted after repeated calls', async () => {
    for (const key of fakeKeys) {
      for (let i = 1; i <= 5; i++) {
        // Fill each key usage to rate limit
        await axios.post('http://localhost:4000/speak', { text: 'hello' }, { headers: { 'xi-api-key': key } });
      }
    }

    // Now all keys should reject with 429
    for (const key of fakeKeys) {
      try {
        await axios.post('http://localhost:4000/speak', { text: 'hello' }, { headers: { 'xi-api-key': key } });
        throw new Error('Expected 429 but did not get');
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          expect(err.response.status).toBe(429);
        } else {
          throw err;
        }
      }
    }
  });
});
