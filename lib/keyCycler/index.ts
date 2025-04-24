const DEBUG_LOG = process.env.KEY_CYCLER_DEBUG === 'true';
type KeyUsage = { [key: string]: number }

interface CyclerState {
  keys: string[]
  index: number
  usage: KeyUsage
}

function debugLog(message: string) {
  if (DEBUG_LOG) {
    console.log('[KeyCycler]', message);
  }
}

const RATE_LIMIT = 5
const cyclers: Record<string, CyclerState> = {}

function loadKeysFromEnv(apiName: string): string[] {
  const prefix = `ENV_${apiName.toUpperCase()}_KEY`
  return Object.entries(process.env)
    .filter(([key]) => key.startsWith(prefix))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value!)
}

export async function getKey(apiName: string): Promise<string> {
  let state = cyclers[apiName]

  if (!state) {
    const keys = loadKeysFromEnv(apiName)
    if (keys.length === 0) {
      throw new Error(`No keys found for ${apiName}`)
    }
debugLog(`Loading keys from env for api ${apiName}. Found keys: ${keys.join(', ')}`);

    state = {
      keys,
      index: 0,
      usage: Object.fromEntries(keys.map(k => [k, 0]))
    }

    cyclers[apiName] = state
  }

  const { keys, usage } = state
  const totalKeys = keys.length

  for (let i = 0; i < totalKeys; i++) {
    const key = keys[state.index]
    state.index = (state.index + 1) % totalKeys

    if (usage[key] < RATE_LIMIT) {
      usage[key]++
      return key
    }
  }

  throw new Error(`All API keys for ${apiName} are rate-limited`)
}

export function markKeyAsFailed(apiName: string, key: string) {
  const state = cyclers[apiName]
  if (state && key in state.usage) {
    state.usage[key] = RATE_LIMIT
  }
debugLog(`Cycler state for ${apiName}: index=${state.index}, usage=${JSON.stringify(state.usage)}`);
}

// Internal helper for testing
export function __resetCyclers__() {
  Object.keys(cyclers).forEach(api => delete cyclers[api])
}

export function _debugState(apiName: string) {
  const state = cyclers[apiName];
  if (!state) return null;
  return {
    keys: [...state.keys],
    index: state.index,
    usage: { ...state.usage }
  };
}
// Conditionally export debugState for test or debug builds
if (process.env.NODE_ENV === 'test' || process.env.DEBUG_MODE === 'true') {
  exports.debugState = _debugState
}

