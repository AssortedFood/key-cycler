# Key Cycler

[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE) [![Build Status](https://img.shields.io/github/actions/workflow/status/AssortedFood/key-cycler/ci.yml?branch=main)](https://github.com/AssortedFood/key-cycler/actions) [![npm version](https://img.shields.io/npm/v/key-cycler)](https://www.npmjs.com/package/key-cycler) [![Downloads](https://img.shields.io/npm/dm/key-cycler)](https://www.npmjs.com/package/key-cycler)

Key Cycler is a TypeScript utility package designed to help you efficiently manage and cycle through multiple API keys for services with restrictive or expensive rate limits. It enables you to seamlessly rotate keys when making requests to APIs, helping you maximize usage within free or low-cost tiers.

## Installation

```bash
npm install key-cycler@0.1.0
# or
yarn add key-cycler@0.1.0
```

## Overview

Many APIs have rate limits or usage tiers that can be difficult to navigate economically. With Key Cycler, you can provide multiple API keys per service, and it will automatically rotate the keys for each request, handling retries and fallback if a key is exhausted or rate limited.

This package serves as a lightweight wrapper around SDKs or HTTP clients like Axios, abstracting the key management logic in one place.

## Environment Variable Setup

To use Key Cycler, you load your API keys into environment variables following a predictable naming pattern. For example, for two different APIs such as **11 Labs** and **Play HT**, you could set:

```
ENV_11LABS_KEY1=your_11labs_key_1
ENV_11LABS_KEY2=your_11labs_key_2
ENV_PLAYHT_KEY1=your_playht_key_1
ENV_PLAYHT_KEY2=your_playht_key_2
```

The utility will load the keys for each API from environment variables prefixed by `ENV_<API_NAME>_KEY` and manage cycling through them.

## Usage

Key Cycler exposes a generic interface for wrapping your API requests. For each request made using the provided wrapper, the tool automatically:

- Uses the next available API key in the list.
- Detects if a key is exhausted or rate limited and skips it.
- Retries with another key if needed.

This keeps your request flow seamless and transparent.

At this stage, the usage is generic and can be integrated easily with any SDK or HTTP client like Axios.

## Development

Currently, the core focus is on implementing efficient key rotation and retry logic. Future expansions may include:

  - Advanced rate limit detection.
  - More SDK-specific helpers or plugins.
  - Improved environment variable formats or configuration methods.

### Pre-commit Hook

A Git pre-commit hook is configured using Husky to run `npm run lint` before each commit. If lint errors are found, the commit will be blocked. Hooks are installed automatically when running `npm install` via the `prepare` script in `package.json`.

## Integration Testing

See `tests/integration/keyCycler.test.ts` for a sample integration test that starts the mock server, resets cycler state, and verifies key cycling under rate limits.

### Example

A minimal integration test using Vitest, Axios, and the mock API server:

```ts
import { getKey, markKeyAsFailed, __resetCyclers__ } from 'key-cycler';
import { startMockServer, stopMockServer, resetKeyUsage } from './mock/fakeApiServer';
import axios from 'axios';
import { loadFakeApiKeys } from './tests/integration/loadFakeApiKeys';

let server: any;
beforeAll(async () => {
  resetKeyUsage();
  __resetCyclers__();
  server = await startMockServer(3000);
});
afterAll(async () => {
  await stopMockServer();
});

describe('Integration: Key Cycler & Mock API', () => {
  it('automatically cycles through all keys until exhaustion', async () => {
    const fakeKeys = loadFakeApiKeys();
    const key = await getKey('fakeapi');
    const res = await axios.post('http://localhost:3000/speak', { text: 'Hello' }, {
      headers: { 'xi-api-key': key },
    });
    expect(res.status).toBe(200);
  });
});

```

For a full example, see `tests/integration/keyCycler.test.ts`.

## License

This project is open source. Please see the LICENSE file for details.

## Contributing

Contributions are welcome! Feel free to open issues or pull requests.
