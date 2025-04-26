import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Key Cycler integration tests', () => {
  beforeAll(() => {
    // TODO: start mock server
  });

  afterAll(() => {
    // TODO: stop mock server
  });

  it('should cycle through keys and handle rate limits (placeholder)', () => {
    // TODO: implement test logic that calls the /speak endpoint repeatedly
    // cycling through keys and validating expected responses
    expect(true).toBe(true);
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
