/**
 * API Utilities - Timeout and Retry Logic
 * 
 * Provides resilient API call patterns to improve app performance and UX.
 * Based on patterns from PERFORMANCE_AND_SECURITY_FIXES.md
 */

import { logger } from './logger';

export interface RetryOptions {
    /** Maximum number of attempts (default: 3) */
    maxAttempts?: number;
    /** Initial delay in ms before first retry (default: 1000) */
    initialDelayMs?: number;
    /** Multiplier for exponential backoff (default: 2) */
    backoffMultiplier?: number;
    /** Maximum delay between retries in ms (default: 10000) */
    maxDelayMs?: number;
    /** Optional description for logging */
    operationName?: string;
}

/**
 * Wraps a promise or thenable with a timeout.
 * Rejects if the promise doesn't resolve within the specified time.
 * Works with Supabase query builders which are thenable but not actual Promises.
 * 
 * @param promiseLike The promise or thenable to wrap
 * @param ms Timeout in milliseconds
 * @param message Optional custom error message
 * @returns The resolved value of the promise
 * @throws Error if timeout is exceeded
 */
export async function withTimeout<T>(
    promiseLike: PromiseLike<T>,
    ms: number,
    message?: string
): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
            reject(new Error(message || `Operation timed out after ${ms}ms`));
        }, ms);
    });

    return Promise.race([Promise.resolve(promiseLike), timeoutPromise]);
}

/**
 * Retries an async function with exponential backoff.
 * Useful for transient network failures.
 * 
 * @param fn The async function to retry
 * @param options Retry configuration
 * @returns The resolved value from the function
 * @throws The last error if all retries fail
 */
export async function runWithRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const {
        maxAttempts = 3,
        initialDelayMs = 1000,
        backoffMultiplier = 2,
        maxDelayMs = 10000,
        operationName = 'Operation',
    } = options;

    let lastError: Error | undefined;
    let delay = initialDelayMs;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            if (attempt === maxAttempts) {
                logger.error(`${operationName} failed after ${maxAttempts} attempts:`, lastError);
                throw lastError;
            }

            logger.warn(`${operationName} attempt ${attempt} failed, retrying in ${delay}ms...`);

            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, delay));

            // Exponential backoff with cap
            delay = Math.min(delay * backoffMultiplier, maxDelayMs);
        }
    }

    // TypeScript: This should never be reached but satisfies the compiler
    throw lastError || new Error(`${operationName} failed`);
}

/**
 * Combines timeout and retry for robust API calls.
 * 
 * @param fn The async function to execute
 * @param timeoutMs Timeout per attempt
 * @param retryOptions Retry configuration
 * @returns The resolved value
 */
export async function withTimeoutAndRetry<T>(
    fn: () => PromiseLike<T>,
    timeoutMs: number,
    retryOptions: RetryOptions = {}
): Promise<T> {
    return runWithRetry(
        async () => withTimeout(fn(), timeoutMs),
        retryOptions
    );
}

// Default timeouts for different operation types
export const API_TIMEOUTS = {
    /** Quick data fetches (profiles, lists) */
    FAST: 10_000,
    /** Standard operations */
    DEFAULT: 15_000,
    /** Edge Function calls with AI processing */
    AI_OPERATION: 60_000,
    /** Auth operations */
    AUTH: 15_000,
} as const;
