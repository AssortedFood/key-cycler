/**
 * Returns the next available API key, rotating and skipping exhausted/failed ones.
 */
export declare function getKey(apiName: string): Promise<string>;
/**
 * Manually mark one key as failed so that it’s skipped going forward.
 */
export declare function markKeyAsFailed(apiName: string, key: string): void;
/**
 * For tests: clear all in-memory cyclers.
 */
export declare function __resetCyclers__(): void;
/**
 * Factory to create a cycler with configuration options.
 * Returns bound getKey, markKeyAsFailed, and debugState functions.
 */
export declare function createCycler(apiName: string, options?: {
    resetInterval?: number;
}): {
    getKey: () => Promise<string>;
    markKeyAsFailed: (key: string) => void;
    debugState: () => ReturnType<typeof debugState>;
};
/**
 * Return a read-only snapshot of pointer, usage and failure flags.
 */
export declare function debugState(apiName: string): Readonly<{
    pointer: number;
    keys: {
        value: string;
        usage: number;
        failed: boolean;
    }[];
}> | null;
