/**
 * Environment-aware logging utility
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Check if we're in development mode
// In production builds, terser will strip console statements anyway
const isDevelopment = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' ||
   window.location.hostname.includes('localhost'));

class Logger {
  private enabled: boolean;

  constructor() {
    // Enable logging in development, disable in production
    // In production, terser will strip console anyway, but we check to avoid unnecessary work
    this.enabled = isDevelopment;
  }

  private log(level: LogLevel, ...args: unknown[]): void {
    if (!this.enabled) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'debug':
        console.debug(prefix, ...args);
        break;
      case 'info':
        console.info(prefix, ...args);
        break;
      case 'warn':
        console.warn(prefix, ...args);
        break;
      case 'error':
        console.error(prefix, ...args);
        break;
    }
  }

  debug(...args: unknown[]): void {
    this.log('debug', ...args);
  }

  info(...args: unknown[]): void {
    this.log('info', ...args);
  }

  warn(...args: unknown[]): void {
    this.log('warn', ...args);
  }

  error(...args: unknown[]): void {
    // Always log errors, even in production (they'll be stripped by terser anyway)
    this.log('error', ...args);
  }

  /**
   * Enable or disable logging programmatically
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if logging is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Export singleton instance
export const logger = new Logger();

