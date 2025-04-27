// lib/keyCycler/index.ts

type KeyState = {
    value: string;
    usage: number;
    failed: boolean;
  };
  
  type Cycler = {
    keys: KeyState[];
    pointer: number;
  };
  
  const RATE_LIMIT = 5;  // your per-key hard limit
  
  // In-memory store: one Cycler per API name
  const cyclers: Map<string, Cycler> = new Map();
  
  /**
   * Initialise a cycler for this apiName by loading ENV_<API>_KEY1…N
   */
  function initCycler(apiName: string): Cycler {
    const prefix = `ENV_${apiName.toUpperCase()}_KEY`;
    const states: KeyState[] = [];
    let idx = 1;
  
    while (true) {
      const envVar = `${prefix}${idx}`;
      const key = process.env[envVar];
      if (!key) break;
      states.push({ value: key, usage: 0, failed: false });
      idx++;
    }
  
    if (states.length === 0) {
      throw new Error(`No keys found for ${apiName}`);
    }
  
    const cycler: Cycler = { keys: states, pointer: 0 };
    cyclers.set(apiName, cycler);
    return cycler;
  }
  
  /**
   * Returns the next available API key, rotating and skipping exhausted/failed ones.
   */
  export async function getKey(apiName: string): Promise<string> {
    const cycler = cyclers.get(apiName) ?? initCycler(apiName);
    const { keys } = cycler;
    const len = keys.length;
  
    for (let attempt = 0; attempt < len; attempt++) {
      // advance pointer round-robin
      const idx = cycler.pointer % len;
      cycler.pointer = (cycler.pointer + 1) % len;
  
      const state = keys[idx];
      if (state.failed) continue;
      if (state.usage >= RATE_LIMIT) continue;
  
      // found a live key
      state.usage += 1;
      return state.value;
    }
  
    throw new Error(`All API keys for ${apiName} are rate-limited`);
  }
  
  /**
   * Manually mark one key as failed so that it’s skipped going forward.
   */
  export function markKeyAsFailed(apiName: string, key: string): void {
    const cycler = cyclers.get(apiName);
    if (!cycler) return;
    const state = cycler.keys.find(k => k.value === key);
    if (state) state.failed = true;
  }
  
  /**
   * For tests: clear all in-memory cyclers.
   */
  export function __resetCyclers__(): void {
    cyclers.clear();
  }
  
  /**
   * Return a read-only snapshot of pointer, usage and failure flags.
   */
  export function debugState(apiName: string) {
    const cycler = cyclers.get(apiName);
    if (!cycler) return null;
    return {
      pointer: cycler.pointer,
      keys: cycler.keys.map(k => ({
        value: k.value,
        usage: k.usage,
        failed: k.failed
      }))
    };
  }
  