// Sentry Error Tracking for Supabase Edge Functions
// Shared utility for initializing and using Sentry across all Edge Functions

import * as Sentry from 'npm:@sentry/deno';

let initialized = false;

/**
 * Initialize Sentry for an Edge Function.
 * Call this at the top of each Edge Function's index.ts.
 * 
 * @param functionName - Name of the edge function for tagging
 */
export function initSentry(functionName: string): void {
    if (initialized) return;

    const dsn = Deno.env.get('SENTRY_DSN');

    if (!dsn) {
        console.warn('SENTRY_DSN not set, error tracking disabled');
        return;
    }

    Sentry.init({
        dsn,
        environment: Deno.env.get('ENVIRONMENT') || 'production',
        // Identify which edge function an error came from
        initialScope: {
            tags: {
                'edge_function': functionName,
            },
        },
        // Sample rate for performance monitoring (keep low for edge functions)
        tracesSampleRate: 0.1,
    });

    initialized = true;
    console.log(`Sentry initialized for ${functionName}`);
}

/**
 * Capture an exception and send to Sentry with optional context.
 * 
 * @param error - The error to capture
 * @param context - Optional additional context
 */
export function captureException(
    error: Error | unknown,
    context?: {
        userId?: string;
        goalId?: string;
        extra?: Record<string, unknown>;
    }
): void {
    if (!initialized) {
        console.error('Sentry not initialized, error not captured:', error);
        return;
    }

    Sentry.withScope((scope) => {
        if (context?.userId) {
            scope.setUser({ id: context.userId });
        }
        if (context?.goalId) {
            scope.setTag('goal_id', context.goalId);
        }
        if (context?.extra) {
            scope.setExtras(context.extra);
        }
        Sentry.captureException(error);
    });
}

/**
 * Capture a message (for warnings, info logs that should go to Sentry).
 * 
 * @param message - The message to capture
 * @param level - Severity level
 */
export function captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error' = 'info'
): void {
    if (!initialized) {
        console.log(`[${level}] ${message}`);
        return;
    }

    Sentry.captureMessage(message, level);
}

/**
 * Wrap an async handler function with Sentry error capturing.
 * Use this to wrap your serve() handler for automatic error capture.
 * 
 * @param handler - The request handler function
 * @param functionName - Name of the edge function
 * @returns Wrapped handler that captures errors
 */
export function wrapHandler(
    handler: (req: Request) => Promise<Response>,
    functionName: string
): (req: Request) => Promise<Response> {
    return async (req: Request): Promise<Response> => {
        try {
            return await handler(req);
        } catch (error) {
            console.error(`[${functionName}] Unhandled error:`, error);

            // Capture the error with request context
            Sentry.withScope((scope) => {
                scope.setTag('edge_function', functionName);
                scope.setExtra('request_url', req.url);
                scope.setExtra('request_method', req.method);
                Sentry.captureException(error);
            });

            // Ensure Sentry has time to send the error before the function terminates
            await Sentry.flush(2000);

            // Re-throw to let the caller handle the response
            throw error;
        }
    };
}

/**
 * Flush pending Sentry events. Call before returning from edge function
 * if you've captured errors manually.
 */
export async function flush(timeout = 2000): Promise<void> {
    if (initialized) {
        await Sentry.flush(timeout);
    }
}

// Re-export Sentry for advanced usage
export { Sentry };
