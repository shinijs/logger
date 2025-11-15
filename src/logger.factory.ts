import { Injectable, Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { CustomLogger } from './logger.service';
import loggerConfig from './logger.config';
import { ILogger, LogContext } from './logger.interface';

@Injectable()
export class ContextBoundLogger implements ILogger {
  constructor(
    private readonly baseLogger: CustomLogger,
    private readonly context: string,
  ) {}

  log(message: string, context?: string): void {
    this.baseLogger.log(message, context || this.context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    this.baseLogger.error(message, error, context || this.context);
  }

  warn(message: string, meta?: Record<string, unknown>, context?: LogContext): void {
    this.baseLogger.warn(message, meta, context || this.context);
  }

  info(message: string, meta?: Record<string, unknown>, context?: LogContext): void {
    this.baseLogger.info(message, meta, context || this.context);
  }

  debug(message: string, meta?: Record<string, unknown>, context?: LogContext): void {
    this.baseLogger.debug(message, meta, context || this.context);
  }

  setContext(_context: string): void {
    // This method exists for compatibility but doesn't change the bound context
    // The context is immutable once the logger is created
  }

  getContext(): string {
    return this.context;
  }
}

@Injectable()
export class LoggerFactory {
  constructor(
    @Inject(loggerConfig.KEY)
    private readonly config: ConfigType<typeof loggerConfig>,
    private readonly baseLogger: CustomLogger,
  ) {}

  /**
   * Creates a context-bound logger instance that automatically applies
   * the specified context to all log messages
   */
  createLogger(context: string): ContextBoundLogger {
    return new ContextBoundLogger(this.baseLogger, context);
  }

  /**
   * Get the base logger instance (for cases where you need the singleton)
   */
  getBaseLogger(): CustomLogger {
    return this.baseLogger;
  }
}
