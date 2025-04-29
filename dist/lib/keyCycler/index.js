"use strict";
// lib/keyCycler/index.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKey = getKey;
exports.markKeyAsFailed = markKeyAsFailed;
exports.__resetCyclers__ = __resetCyclers__;
exports.createCycler = createCycler;
exports.debugState = debugState;
// const RATE_LIMIT = 5;  // removed hard-coded per-key limit
// In-memory store: one Cycler per API name
const cyclers = new Map();
/**
 * Initialise a cycler for this apiName by loading ENV_<API>_KEY1…N
 */
/**
 * Initialize a cycler for this apiName, with optional resetInterval (ms).
 */
function initCycler(apiName, options) {
    const prefix = `ENV_${apiName.toUpperCase()}_KEY`;
    const states = [];
    let idx = 1;
    while (true) {
        const envVar = `${prefix}${idx}`;
        const key = process.env[envVar];
        if (!key)
            break;
        states.push({ value: key, usage: 0, failed: false });
        idx++;
    }
    if (states.length === 0) {
        throw new Error(`No keys found for ${apiName}`);
    }
    const cycler = { keys: states, pointer: 0 };
    if ((options === null || options === void 0 ? void 0 : options.resetInterval) != null) {
        cycler.resetInterval = options.resetInterval;
        cycler.lastReset = Date.now();
    }
    cyclers.set(apiName, cycler);
    return cycler;
}
/**
 * Returns the next available API key, rotating and skipping exhausted/failed ones.
 */
function getKey(apiName) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        // Retrieve or initialize cycler (no resetInterval by default)
        const cycler = (_a = cyclers.get(apiName)) !== null && _a !== void 0 ? _a : initCycler(apiName);
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
            if (state.failed)
                continue;
            // found a live key
            state.usage += 1;
            return state.value;
        }
        throw new Error(`All API keys for ${apiName} are exhausted`);
    });
}
/**
 * Manually mark one key as failed so that it’s skipped going forward.
 */
function markKeyAsFailed(apiName, key) {
    const cycler = cyclers.get(apiName);
    if (!cycler)
        return;
    const state = cycler.keys.find(k => k.value === key);
    if (state)
        state.failed = true;
}
/**
 * For tests: clear all in-memory cyclers.
 */
function __resetCyclers__() {
    cyclers.clear();
}
/**
 * Factory to create a cycler with configuration options.
 * Returns bound getKey, markKeyAsFailed, and debugState functions.
 */
function createCycler(apiName, options) {
    // Remove existing cycler to apply new options
    cyclers.delete(apiName);
    // Initialize with options
    initCycler(apiName, options);
    return {
        getKey: () => getKey(apiName),
        markKeyAsFailed: (key) => markKeyAsFailed(apiName, key),
        debugState: () => debugState(apiName),
    };
}
/**
 * Return a read-only snapshot of pointer, usage and failure flags.
 */
function debugState(apiName) {
    // Only available in non-production (test or debug) environments
    if (process.env.NODE_ENV === 'production') {
        throw new Error('debugState is only available in test or debug mode');
    }
    const cycler = cyclers.get(apiName);
    if (!cycler)
        return null;
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
