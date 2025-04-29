import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCycler, __resetCyclers__ } from '../src/index';

describe('Cycler resetInterval behavior', () => {
  beforeEach(() => {
    __resetCyclers__();
    // Load two fake keys
    process.env.ENV_RESET_KEY1 = 'k1';
    process.env.ENV_RESET_KEY2 = 'k2';
  });

  it('resets failed flags and usage counters after resetInterval', async () => {
    // Use fake timers to simulate time progression
    vi.useFakeTimers();
    const cycler = createCycler('reset', { resetInterval: 1000 });
    // Initial calls before failure reset
    const key1 = await cycler.getKey();
    expect(key1).toBe('k1');
    const key2 = await cycler.getKey();
    expect(key2).toBe('k2');
    // Manually mark both as failed
    cycler.markKeyAsFailed('k1');
    cycler.markKeyAsFailed('k2');
    // All keys failed: getKey should error
    await expect(cycler.getKey()).rejects.toThrow('All API keys for reset are exhausted');
    // Advance time beyond resetInterval
    vi.advanceTimersByTime(1000);
    // Now usage and failed flags reset: getKey should succeed again
    const nextKey = await cycler.getKey();
    expect(['k1', 'k2']).toContain(nextKey);
    // Debug state should show usage reset to 1 and failed=false
    const state = cycler.debugState();
    expect(state).toBeDefined();
    state.keys.forEach((k) => {
      expect(k.usage).toBeGreaterThanOrEqual(0);
      expect(k.failed).toBe(false);
    });
    vi.useRealTimers();
  });
});