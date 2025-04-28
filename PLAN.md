# 📋 Test-Fix Task List

These subtasks outline the steps needed to bring all Vitest tests back to passing under the updated round-robin cycling behavior (no hard-coded rate limits).

---

## 1. Align error messages
- [ ] Decide on canonical error text (e.g. “exhausted” vs “rate-limited”).
- [ ] Update unit tests in `tests/keyCycler.test.ts` to expect the chosen text in both exhaustion and manual-failure cases.
- [ ] Update integration tests in `tests/integration/keyCycler.test.ts` to match the same error text.

## 2. Remove in-memory RATE_LIMIT tests
- [ ] In `tests/keyCycler.test.ts`, remove or refactor the “respects rate limits and skips exhausted keys” test so it verifies pure round-robin cycling without a usage cap.
- [ ] In that same file, remove the 5-iteration exhaustion loop and related assertions that depend on a hard limit of 5 uses per key.

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