# PLAN.md

## 🧪 Objective

Create a mock API to test the key-cycler utility with fake API keys, simulating rate limiting behaviour (`429 Too Many Requests`) and verifying that `getKey` and `markKeyAsFailed` behave correctly without needing access to a real API (like ElevenLabs).

---

## 🧱 Step 1: Build the Mock API

| ✅ | Subtask | Description |
|----|---------|-------------|
| [ ] | 1.1 | Create file: `mock/fakeApiServer.ts` |
| [ ] | 1.2 | Set up Express app with one route: `POST /speak` |
| [ ] | 1.3 | Accept header `xi-api-key` and simulate a JSON payload |
| [ ] | 1.4.1 | Create an in-memory `Map<string, number>` to track key usage |
| [ ] | 1.4.2 | Increment the count for `xi-api-key` on each request |
| [ ] | 1.4.3 | Create helper `resetKeyUsage()` to clear internal usage state |
| [ ] | 1.4.4 | Export usage map if needed for debug assertions |
| [ ] | 1.5.1 | Define a rate limit threshold (e.g., `RATE_LIMIT = 5`) |
| [ ] | 1.5.2 | If usage exceeds `RATE_LIMIT`, return `429 Too Many Requests` |
| [ ] | 1.5.3 | Otherwise return a dummy success payload (e.g. `{ audio: "fake_data" }`) |
| [ ] | 1.6 | Return 400 or 401 on missing/malformed headers for robustness |
| [ ] | 1.7.1 | Implement `startMockServer(port): Promise<Server>` |
| [ ] | 1.7.2 | Implement `stopMockServer(server): Promise<void>` |
| [ ] | 1.7.3 | Ensure compatibility with Vitest lifecycle (`beforeAll` / `afterAll`) |

---

## 🧪 Step 2: Write Integration Tests with Mock API

| ✅ | Subtask | Description |
|----|---------|-------------|
| [ ] | 2.1 | Create test file `tests/integration/keyCycler.integration.test.ts` |
| [ ] | 2.2 | Load fake env keys (`ENV_FAKEAPI_KEY1`, `KEY2`, `KEY3`, etc.) |
| [ ] | 2.3 | Test: basic call to `/speak` uses a valid key and returns 200 |
| [ ] | 2.4.1 | Set up env with 2–3 fake keys |
| [ ] | 2.4.2 | Call `/speak` repeatedly until all keys are exhausted |
| [ ] | 2.4.3 | Expect 429 or final fallback to throw from `getKey()` |
| [ ] | 2.5.1 | Simulate 429 for a specific key in server logic |
| [ ] | 2.5.2 | Call `markKeyAsFailed("fakeapi", key)` in response |
| [ ] | 2.5.3 | Expect next call to `getKey("fakeapi")` to yield a new key |
| [ ] | 2.5.4 | Optionally simulate retry logic at app level |
| [ ] | 2.6 | Assert key usage map reflects accurate usage totals |
| [ ] | 2.7 | Confirm server shuts down cleanly after test runs |

---

## 🧩 Step 3: Enhance KeyCycler for Test Support

| ✅ | Subtask | Description |
|----|---------|-------------|
| [ ] | 3.1.1 | Add `debugState(apiName)` to return internal key usage state |
| [ ] | 3.1.2 | Ensure it's typed defensively (read-only or cloned) |
| [ ] | 3.1.3 | Export `debugState` only for testing/debug builds |
| [ ] | 3.2 | (Optional) Add logging for key cycling for local inspection |

---

## 🔁 Dependencies

| Subtask | Depends On |
|---------|------------|
| 1.5.2 | 1.4.1, 1.5.1 |
| 1.5.3 | 1.5.2 |
| 2.2 | 1.7.1 |
| 2.3 | 1.2, 1.3 |
| 2.4.2 | 1.5.2 |
| 2.4.3 | 2.4.2 |
| 2.5.2 | 2.5.1 |
| 2.5.3 | 2.5.2 |
| 2.6 | 1.4.4 |
| 2.7 | 1.7.2 |
| 3.1.2 | 3.1.1 |
| 3.1.3 | 3.1.1 |

---

## 🧭 Suggested Order of Execution

```
1.1 → 1.2 → 1.3  
→ 1.4.1 → 1.4.2 → 1.4.3 → 1.4.4  
→ 1.5.1 → 1.5.2 → 1.5.3  
→ 1.6  
→ 1.7.1 → 1.7.2 → 1.7.3  
→ 2.1 → 2.2 → 2.3  
→ 2.4.1 → 2.4.2 → 2.4.3  
→ 2.5.1 → 2.5.2 → 2.5.3 → 2.5.4  
→ 2.6 → 2.7  
→ 3.1.1 → 3.1.2 → 3.1.3  
→ 3.2
```

---

## 📌 Notes

- The mock server should **only run in test environments**.
- Test coverage should include:
  - Rotation
  - Exhaustion
  - Retry after failure
  - Isolation across multiple API names
- Keep mock keys like `ENV_FAKEAPI_KEY1` in `.env.test.local` or injected directly in tests.