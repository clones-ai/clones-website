/**
 * Production-safe logging utility
 * Only logs in development environment
 */

type LogLevel = 'log' | 'warn' | 'error' | 'info';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, ...args: any[]) {
    if (this.isDevelopment) {
      console[level](...args);
    }
  }

  info(...args: any[]) {
    this.log('info', ...args);
  }

  warn(...args: any[]) {
    this.log('warn', ...args);
  }

  error(...args: any[]) {
    this.log('error', ...args);
  }

  debug(...args: any[]) {
    this.log('log', ...args);
  }
}

export const logger = new Logger();