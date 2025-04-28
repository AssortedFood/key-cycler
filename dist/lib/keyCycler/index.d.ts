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
