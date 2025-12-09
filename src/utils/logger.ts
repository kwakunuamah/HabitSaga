/**
 * Conditional logger that only logs in development mode.
 * Use this instead of console.log throughout the app to prevent
 * debug output in production builds.
 * 
 * Usage:
 *   import { logger } from '../utils/logger';
 *   logger.log('Debug message');
 *   logger.error('Error message'); // Always logs
 */

const isDev = __DEV__;

export const logger = {
    /**
     * Log general debug information (development only)
     */
    log: (...args: any[]) => isDev && console.log(...args),

    /**
     * Log warnings (development only)
     */
    warn: (...args: any[]) => isDev && console.warn(...args),

    /**
     * Log errors (always - production and development)
     */
    error: (...args: any[]) => console.error(...args),

    /**
     * Log info messages (development only)
     */
    info: (...args: any[]) => isDev && console.info(...args),
};
