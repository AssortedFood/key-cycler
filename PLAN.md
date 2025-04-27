# 📋 Task List

Each top-level task is numbered. Subtasks are lettered and are tracked individually. Every completed subtask must trigger a Git commit.

1. Finalize the Mock API

[x] 1.a Define Express app skeleton (mock/fakeApiServer.ts).  
[x] 1.b Implement POST /speak route accepting xi-api-key header.  
[x] 1.c Create in-memory usage map and resetKeyUsage() helper.  
[x] 1.d Enforce rate limit (RATE_LIMIT = 5), return 429 on exceed.  
[x] 1.e Return dummy success payload when under limit.  
[x] 1.f Handle missing/malformed headers (400/401 responses).  
[x] 1.g Implement startMockServer(port) and stopMockServer(server).

2. Complete Integration Tests

[x] 2.a Populate tests/integration/keyCycler.integration.test.ts.  
[x] 2.b Load fake environment keys (ENV_FAKEAPI_KEY1…N).  
[x] 2.c Start mock server in beforeAll, stop in afterAll.  
[x] 2.d Perform repeated POST /speak calls to simulate rate limits.  
[x] 2.e Assert 200 responses until rate limit exceeded.  
[x] 2.f On 429, call markKeyAsFailed() and verify key rotation.  
[x] 2.g Verify behavior when all keys are exhausted.

3. Consolidate Public API

[x] 3.a Export getKey, markKeyAsFailed, and debugState from src/index.ts.  
[x] 3.b Ensure clean imports from lib/keyCycler/index.ts.
[x] 3.c Add unit tests for debugState (verify pointer, usage and failed flags).

4. Enhance Debug Support

[x] 4.a Implement _debugState(apiName).  
[ ] 4.b Properly expose debugState only in test or debug mode.  
[ ] 4.c Verify debugState is read-only or cloned.

5. Documentation Updates

[ ] 5.a Add an Integration Test usage example to README.md.  
[ ] 5.b Revise NAMING.md if necessary to match any new patterns.