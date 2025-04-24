# Refactor Plan: KeyCycler as a Centralised Singleton Utility

## ✅ Objective

Refactor the KeyCycler utility to support the usage:

```js
const key = await getKey("elevenlabs");
```

This enables internal key cycling, retry logic, and automatic exhaustion tracking, abstracted away from integration points.

---

## 📋 Task Breakdown

### Step 1: Setup New KeyCycler Utility

| ✅ | Subtask | Description |
|----|---------|-------------|
| [x] | 1.1 | Create a new file: `lib/keyCycler/index.ts` |
| [ ] | 1.2 | Define a `CyclerState` type to hold keys, usage count, and index |
| [ ] | 1.3 | Write `loadKeysFromEnv(apiName: string): string[]` helper |
| [ ] | 1.4 | Create internal map `const cyclers: Record<string, CyclerState>` |
| [ ] | 1.5 | Implement `async getKey(apiName: string): Promise<string>` |
| [ ] | 1.6 | Implement `markKeyAsFailed(apiName: string, key: string)` function |
| [ ] | 1.7 | Export `getKey` and `markKeyAsFailed` from the module |

---

### Step 2: Integrate Into ElevenLabs

| ✅ | Subtask | Description |
|----|---------|-------------|
| [ ] | 2.1 | Modify `lib/elevenlabs.js` to `import { getKey, markKeyAsFailed }` |
| [ ] | 2.2 | Replace `process.env.ELEVENLABS_API_KEY` with `await getKey("elevenlabs")` |
| [ ] | 2.3 | Catch `429` errors and call `markKeyAsFailed("elevenlabs", key)` |
| [ ] | 2.4 | Ensure the function signature of `textToSpeech()` remains unchanged |

---

### Step 3: Configuration & Key Management

| ✅ | Subtask | Description |
|----|---------|-------------|
| [ ] | 3.1 | Update `.env.local` to use `ENV_ELEVENLABS_KEY1`, `KEY2`, etc. |
| [ ] | 3.2 | Document the required format for ElevenLabs in `NAMING.md` |
| [ ] | 3.3 | Update `README.md` to reflect new usage style with `getKey()` |

---

### Step 4: Testing & Diagnostics

| ✅ | Subtask | Description |
|----|---------|-------------|
| [ ] | 4.1 | Create a test file: `tests/lib/keyCycler.test.ts` |
| [ ] | 4.2 | Write tests for `getKey()` rotation logic |
| [ ] | 4.3 | Write tests for `markKeyAsFailed()` effect |
| [ ] | 4.4 | Add test for ElevenLabs using mocked `getKey()` logic |
| [ ] | 4.5 | (Optional) Add `debugState(apiName)` export for internal state logging |

---

### Step 5: Cleanup & Migration

| ✅ | Subtask | Description |
|----|---------|-------------|
| [ ] | 5.1 | Remove `usageMap` from old KeyCycler implementation |
| [ ] | 5.2 | Deprecate or archive `src/fakeApi.ts` if no longer needed |
| [ ] | 5.3 | (Optional) Migrate other APIs like GPT to use `getKey()` utility |

---

## 🔄 Dependencies

| Subtask | Depends On |
|---------|------------|
| 2.2 | 1.5 |
| 2.3 | 1.6 |
| 2.1 | 1.7 |
| 3.2 | 3.1 |
| 3.3 | 1.5 |
| 4.4 | 1.7, 2.2 |
| 5.1 | 1.5, 1.6 |
| 5.2 | 5.1 |

---

## 🧭 Suggested Task Order (Based on Dependencies)

1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7  
2.1 → 2.2 → 2.3 → 2.4  
3.1 → 3.2  
3.3  
4.1 → 4.2 → 4.3  
4.4  
5.1 → 5.2  
5.3 (optional)

---

## 📝 Notes

- Keys must follow format: `ENV_<API>_KEY1`, `ENV_<API>_KEY2`, ...
- Initial scope targets ElevenLabs integration. GPT can follow after.
- Consider exporting `debugState(apiName)` for local logging of rotation status.