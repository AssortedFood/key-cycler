// lib/keyCycler/index.ts

type KeyState = {
    value: string;
    usage: number;
    failed: boolean;
  };
  
  type Cycler = {
    keys: KeyState[];
    pointer: number;
    // Optional reset interval in milliseconds
    resetInterval?: number;
    // Timestamp of the last reset
    lastReset?: number;
  };
  
  // const RATE_LIMIT = 5;  // removed hard-coded per-key limit
  
  // In-memory store: one Cycler per API name
  const cyclers: Map<string, Cycler> = new Map();
  
  /**
   * Initialise a cycler for this apiName by loading ENV_<API>_KEY1…N
   */
  /**
   * Initialize a cycler for this apiName, with optional resetInterval (ms).
   */
  function initCycler(apiName: string, options?: { resetInterval?: number }): Cycler {
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
    if (options?.resetInterval != null) {
      cycler.resetInterval = options.resetInterval;
      cycler.lastReset = Date.now();
    }
    cyclers.set(apiName, cycler);
    return cycler;
  }
  
  /**
   * Returns the next available API key, rotating and skipping exhausted/failed ones.
   */
  export async function getKey(apiName: string): Promise<string> {
    // Retrieve or initialize cycler (no resetInterval by default)
    const cycler = cyclers.get(apiName) ?? initCycler(apiName);
    // Handle periodic reset if configured
    if (cycler.resetInterval != null && cycler.lastReset != null) {
      const now = Date.now();
      if (now - cycler.lastReset >= cycler.resetInterval) {
        // Reset failed flags and usage counters
        cycler.lastReset = now;
        for (const state of cycler.keys) {
          state.failed = false;
          state.usage = 0;
        }
      }
    }
    const { keys } = cycler;
    const len = keys.length;
  
    for (let attempt = 0; attempt < len; attempt++) {
      // advance pointer round-robin
      const idx = cycler.pointer % len;
      cycler.pointer = (cycler.pointer + 1) % len;
  
      const state = keys[idx];
      if (state.failed) continue;
  
      // found a live key
      state.usage += 1;
      return state.value;
    }
  
    throw new Error(`All API keys for ${apiName} are exhausted`);
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
 * Factory to create a cycler with configuration options.
 * Returns bound getKey, markKeyAsFailed, and debugState functions.
 */
export function createCycler(
  apiName: string,
  options?: { resetInterval?: number }
): {
  getKey: () => Promise<string>;
  markKeyAsFailed: (key: string) => void;
  debugState: () => ReturnType<typeof debugState>;
} {
  // Remove existing cycler to apply new options
  cyclers.delete(apiName);
  // Initialize with options
  initCycler(apiName, options);
  return {
    getKey: () => getKey(apiName),
    markKeyAsFailed: (key: string) => markKeyAsFailed(apiName, key),
    debugState: () => debugState(apiName),
  };
}
  
  /**
   * Return a read-only snapshot of pointer, usage and failure flags.
   */
export function debugState(apiName: string) {
  // Only available in non-production (test or debug) environments
  if (process.env.NODE_ENV === 'production') {
    throw new Error('debugState is only available in test or debug mode');
  }
  const cycler = cyclers.get(apiName);
  if (!cycler) return null;
  // Build a snapshot of current state
  const snapshot = {
    pointer: cycler.pointer,
    keys: cycler.keys.map(k => ({
      value: k.value,
      usage: k.usage,
      failed: k.failed
    }))
  };
  // Freeze each key object to prevent external mutation
  snapshot.keys.forEach(Object.freeze);
  // Freeze the keys array and the snapshot object
  Object.freeze(snapshot.keys);
  return Object.freeze(snapshot);
}
  