# Development Plan for Key Cycler Utility

| Step | Subtasks | Dependencies | Done |
|-------|----------|--------------|-------|
| 1 | Use `src/` folder for key cycling utility and related code | None | [x] |
| 2 | Expand `tests/keyCycler.test.ts` with full key cycling test scenarios assuming fake API | Step 1 | [x] |
| 3 | Define environment variable naming and file naming conventions for keys and tests | Step 2 | [x] |
| 4 | Build a fake test API simulating rate limits, key exhaustion, and identifiable responses | Step 3 | [x] |
| 5 | Implement core KeyCycler module to manage keys, cycling, retrying based on API feedback | Step 4 | [x] |
| 6 | Connect KeyCycler with fake API and run full integration tests | Steps 4, 5 | [x] |

This plan tracks each key development step with dependencies, so we can check off progress as we move forward.
