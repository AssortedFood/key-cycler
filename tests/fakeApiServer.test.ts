import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';
import { startMockServer, stopMockServer, resetKeyUsage } from '../mock/fakeApiServer';
import { AddressInfo } from 'net';

describe('Mock API server smoke test', () => {
  let server: any;
  let baseUrl: string;

  beforeAll(async () => {
    resetKeyUsage();
    server = await startMockServer(0);
    const address = (server.address() as AddressInfo);
    baseUrl = `http://localhost:${address.port}`;
  });

  afterAll(async () => {
    await stopMockServer();
  });

  it('responds with 200 up to rate limit and 429 on N+1th request', async () => {
    const apiKey = 'testKey';
    // Default rate limit is 5
    for (let i = 1; i <= 5; i++) {
      const res = await axios.post(
        `${baseUrl}/speak`,
        { text: 'hello' },
        { headers: { 'xi-api-key': apiKey } }
      );
      expect(res.status).toBe(200);
    }
    await expect(
      axios.post(
        `${baseUrl}/speak`,
        { text: 'hello' },
        { headers: { 'xi-api-key': apiKey } }
      )
    ).rejects.toMatchObject({ response: { status: 429 } });
  });
});