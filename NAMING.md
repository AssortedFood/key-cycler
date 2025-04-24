# Naming Conventions for Key Cycler Project

## Environment Variable Naming

- Prefix: `ENV_`
- API name uppercase without spaces or special characters (e.g., `11LABS`, `PLAYHT`)
- Followed by `_KEY` and a 1-based index number

Examples:

```
ENV_11LABS_KEY1=your_11labs_key_1
ENV_11LABS_KEY2=your_11labs_key_2
ENV_PLAYHT_KEY1=your_playht_key_1
ENV_PLAYHT_KEY2=your_playht_key_2
```

## Key Files Naming

If keys are stored in files, use JSON or YAML format with API name as prefix:

- `11labs.keys.json`
- `playht.keys.json`

## Test Files Naming

- Place all test files in the `tests/` folder.
- Name test files after their modules with `.test.ts` suffix.

Example:

- `keyCycler.test.ts`

