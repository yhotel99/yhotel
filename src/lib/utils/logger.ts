/**
 * Logger utility - only logs in development mode
 * This helps reduce console noise in production and improves performance
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (..._args: unknown[]) => {
    // Intentionally no-op: keep API compatibility without stdout noise.
  },
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    // Always log errors, even in production
    console.error(...args);
  },
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
};
