# 📋 Test-Fix Task List

These subtasks outline the steps needed to bring all Vitest tests back to passing under the updated round-robin cycling behavior (no hard-coded rate limits).

---

## 1. Align error messages
- [x] Decide on canonical error text (rate-limited per OBJECTIVE.md).
- [x] Update unit tests in `tests/keyCycler.test.ts` to expect the chosen text in both exhaustion and manual-failure cases.
- [ ] Update integration tests in `tests/integration/keyCycler.test.ts` to match the same error text.

## 2. Remove in-memory RATE_LIMIT tests
- [x] In `tests/keyCycler.test.ts`, remove or refactor the “respects rate limits and skips exhausted keys” test so it verifies pure round-robin cycling without a usage cap.
- [x] In that same file, remove the 5-iteration exhaustion loop and related assertions that depend on a hard limit of 5 uses per key.

## 3. Simplify markKeyAsFailed tests
- [ ] Update the “markKeyAsFailed manually expires a key early” unit test to:
  - Omit looping 5 times to exhaust keys; instead call `markKeyAsFailed` immediately after one access.
  - Assert that subsequent `getKey` calls always return the remaining key(s) in round-robin order until manually failed.

## 4. Revise integration tests
- [ ] Remove the `const RATE_LIMIT = 5;` import from `tests/integration/keyCycler.test.ts`.
- [ ] For the “automatically cycles through all keys until exhaustion” test:
  - Change the loop to run exactly `fakeKeys.length` iterations and verify each key is returned once in order.
  - Drop the final `getKey`-throws error assertion (server-driven failures are handled via `markKeyAsFailed`).
- [ ] For the manual-failure flow tests, update error-message expectations and ensure `markKeyAsFailed` is called on the right key after a 429 from the mock server.

## 5. Run and validate
- [ ] Run `npm test` and confirm all unit and integration tests pass.
- [ ] Commit the updated tests and updated `PLAN.md` with message:
      "🔨 Complete test-fix PLAN and refactor tests"

## 6. Enhance integration server behavior
- 6.a Extend `mock/fakeApiServer` to accept a custom per-key usage limit:
  - [ ] 6.a.i Add a parameter or environment variable to configure the per-key quota in `startMockServer`.
  - [ ] 6.a.ii In the server, track usage counts per API key and enforce the limit: after N requests respond 429.
  - [ ] 6.a.iii Write a small smoke test to verify the server correctly returns 429 on the N+1th request.

- 6.b Configure and verify integration tests use the custom limit:
  - [ ] 6.b.i Update `tests/integration/keyCycler.test.ts` to start the mock server with a low quota (e.g. 2).
  - [ ] 6.b.ii In the “automatically cycles…” test, assert that after the configured limit is reached, requests for that key produce a 429.

- 6.c Assert cycler reacts to server 429 and rotates keys:
  - [ ] 6.c.i In integration tests, upon receiving a 429 for one key, call `markKeyAsFailed` explicitly or via a wrapper.
  - [ ] 6.c.ii Verify the next `getKey` returns the alternate key and that the request succeeds with status 200.

## 7. Plan for exhaustion-reset configuration
- 7.a Define the reset interval concept and API:
  - [ ] 7.a.i Determine acceptable interval formats (e.g. ISO duration string, cron expression, number of ms).
  - [ ] 7.a.ii Add an optional `resetInterval` field to the cycler initialization/config object.

- 7.b Extend cycler factory to accept configuration:
  - [ ] 7.b.i Implement a factory function (e.g. `createCycler(apiName, options)`) that accepts `resetInterval`.
  - [ ] 7.b.ii Ensure backward compatibility by defaulting to no reset when option omitted.

- 7.c Implement periodic state reset:
  - [ ] 7.c.i On each `getKey` call, check if `now >= lastReset + resetInterval`; if so, clear `failed` flags and reset usage counters.
  - [ ] 7.c.ii Persist `lastReset` timestamp in the cycler state.

- 7.d Write unit tests for reset logic:
  - [ ] 7.d.i Use mocked timers to simulate clock advancing beyond `resetInterval`.
  - [ ] 7.d.ii Confirm that after the interval expires, previously `failed` keys re-enter rotation.
  - [ ] 7.d.iii Confirm that usage counters reset if desired by configuration.

- 7.e Update documentation:
  - [ ] 7.e.i Add `resetInterval` usage section to README.
  - [ ] 7.e.ii Document new factory API in OBJECTIVE.md and usage examples.