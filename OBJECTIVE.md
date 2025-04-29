# Objective

This document defines the intended integration pattern for the Key Cycler package once implementation is complete.  
It serves as a stable reference point during ongoing iterations.

---

## Purpose

Replace hardcoded API keys in access requests with a dynamic retrieval system using `getKey(apiName)`, enabling seamless key cycling under rate limits.

---

## Example: Axios API Request

```ts
import { getKey } from 'key-cycler'
import axios from 'axios'

async function makeSpeechRequest(payload: any) {
  const apiKey = await getKey('11labs') // Dynamically retrieves a usable key
  const response = await axios.post('https://api.11labs.io/speak', payload, {
    headers: {
      'xi-api-key': apiKey
    }
  })
  return response.data
}


---

Behavior Expectations

getKey('11labs') will return the next available valid API key from environment variables (ENV_11LABS_KEY1, ENV_11LABS_KEY2, etc.).

If an API key reaches its rate limit, markKeyAsFailed('11labs', key) can be called to force it into an exhausted state early.

The caller does not manage retries or exhaustion manually — KeyCycler automatically rotates keys.

When all keys are exhausted, getKey will throw an error:
"All API keys for 11labs are rate-limited".



---

Environment Variable Setup Example

ENV_11LABS_KEY1=your_11labs_key_1
ENV_11LABS_KEY2=your_11labs_key_2
ENV_11LABS_KEY3=your_11labs_key_3


---

Notes

This pattern is transport-agnostic — it works with Axios, Fetch, SDKs, etc.

apiName must match the environment prefix without typos (e.g., '11labs').
  
---
  
## Exhaustion Reset Configuration
  
For long-running processes, you may want keys to be eligible for reuse after a cooldown interval.
Use the `createCycler` factory to configure a `resetInterval` (in milliseconds) per API:
  
```ts
import { createCycler } from 'key-cycler';
  
// Reset failed keys every hour (3600000 ms)
const { getKey, markKeyAsFailed } = createCycler('11labs', { resetInterval: 3600000 });
  
async function makeRequest() {
  const apiKey = await getKey('11labs');
  // ...
}
```
  
After `resetInterval` elapses, the cycler automatically clears its failure flags and usage counters, allowing all keys to re-enter rotation.


