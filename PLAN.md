PLAN.md

🎯 Objective

Enable an AI-driven workflow that systematically executes and tracks every task and subtask needed to fully implement, test, and maintain the Key Cycler utility, with clear iteration steps, progress markers, and automatic Git commits for each completed item.


---

📋 Task List

Each top-level task is numbered. Subtasks are lettered and can be tracked as the AI progresses. Every completed subtask triggers a Git commit.

1. Build the Mock API

[ ] 1.a Define Express app skeleton (mock/fakeApiServer.ts).

[ ] 1.b Implement POST /speak route accepting xi-api-key header.

[ ] 1.c Create in-memory usage map and resetKeyUsage() helper.

[ ] 1.d Enforce rate limit (RATE_LIMIT = 5), return 429 on exceed.

[ ] 1.e Return dummy success payload when under limit.

[ ] 1.f Handle missing/malformed headers (400/401 responses).

[ ] 1.g Implement startMockServer(port) and stopMockServer(server).



2. Write Integration Tests

[ ] 2.a Configure Vitest suite in tests/integration/keyCycler.integration.test.ts.

[ ] 2.b Load fake env keys (ENV_FAKEAPI_KEY1…N).

[ ] 2.c Start mock server (beforeAll), stop in afterAll.

[ ] 2.d Perform repeated POST /speak calls to exercise rate limits.

[ ] 2.e Assert 200 responses until limit, then 429.

[ ] 2.f On 429, call markKeyAsFailed() and retry with new key.

[ ] 2.g Verify final exhaustion behavior throws.



3. Enhance KeyCycler Debug Support

[ ] 3.a Expose internal state via debugState(apiName) in test builds.

[ ] 3.b Ensure debugState is read-only or returns a clone.

[ ] 3.c Import/export cleanup: surface debugState in public API.



4. Clean Up Source Structure

[ ] 4.a Consolidate public exports in src/KeyCycler.ts (or remove if unused).

[ ] 4.b Ensure lib/keyCycler/index.ts and src/KeyCycler.ts align as single entrypoint.



5. Documentation Updates

[ ] 5.a Update README.md with integration example snippet.

[ ] 5.b Revise NAMING.md with any learned best practices.





---

🔄 AI Iteration Workflow

1. Load this plan and parse the numbered tasks.


2. For each top-level task:

Locate the first unchecked subtask.

Execute that subtask:

Generate code, tests, or documentation as needed.

Mark the subtask with ✅ in PLAN.md.

Create a Git commit with a descriptive message matching the subtask title (e.g., "Implement mock POST /speak route").




3. Run automated tests (unit and integration) to validate changes.


4. Proceed to the next unchecked subtask. If all subtasks under a task are done, move to the next task.


5. Loop until every checkbox is ✅.


6. Report a summary of completed tasks and open items.
