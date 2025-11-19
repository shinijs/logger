import { Injectable, LoggerService } from '@nestjs/common';
import { CustomLogger } from './logger.service';
import { ILogger, LogContext } from './logger.interface';

// Note: The 'any' types in method overloads below are intentional for NestJS LoggerService compatibility
/* eslint-disable @typescript-eslint/no-explicit-any */
@Injectable()
export class ContextBoundLogger implements ILogger, LoggerService {
  constructor(
    private readonly baseLogger: CustomLogger,
    private readonly context: string,
  ) {}

  // ILogger interface methods
  log(message: string, context?: string): void {
    this.baseLogger.log(message, context || this.context);
  }

  // Overloaded methods to support both ILogger and LoggerService signatures
  error(message: string, error?: Error | unknown, context?: LogContext): void;
  error(message: any, trace?: string, context?: string): void;
  error(
    message: any,
    errorOrTrace?: Error | unknown | string,
    context?: LogContext | string,
  ): void {
    const ctx = typeof context === 'string' ? context : (context as LogContext) || this.context;
    if (typeof errorOrTrace === 'string') {
      // LoggerService signature: error(message, trace?, context?)
      this.baseLogger.error(message, errorOrTrace, ctx);
    } else {
      // ILogger signature: error(message, error?, context?)
      this.baseLogger.error(message, errorOrTrace, ctx);
    }
  }

  warn(message: string, meta?: Record<string, unknown>, context?: LogContext): void;
  warn(message: any, context?: string): void;
  warn(message: any, metaOrContext?: Record<string, unknown> | string, context?: LogContext): void {
    // Ensure message is a string
    const messageStr = typeof message === 'string' ? message : String(message);

    if (metaOrContext === undefined && context === undefined) {
      // LoggerService signature: warn(message) - single argument, use bound context
      this.baseLogger.warn(messageStr, undefined, this.context);
    } else if (typeof metaOrContext === 'string') {
      // LoggerService signature: warn(message, context?)
      this.baseLogger.warn(messageStr, undefined, metaOrContext || this.context);
    } else {
      // ILogger signature: warn(message, meta?, context?)
      this.baseLogger.warn(messageStr, metaOrContext, context || this.context);
    }
  }

  info(message: string, meta?: Record<string, unknown>, context?: LogContext): void {
    this.baseLogger.info(message, meta, context || this.context);
  }

  debug(message: string, meta?: Record<string, unknown>, context?: LogContext): void;
  debug(message: any, context?: string): void;
  debug(
    message: any,
    metaOrContext?: Record<string, unknown> | string,
    context?: LogContext,
  ): void {
    if (typeof metaOrContext === 'string') {
      // LoggerService signature: debug?(message, context?)
      this.baseLogger.debug(message, undefined, metaOrContext || this.context);
    } else {
      // ILogger signature: debug(message, meta?, context?)
      this.baseLogger.debug(message, metaOrContext, context || this.context);
    }
  }

  verbose(message: string, meta?: Record<string, unknown>, context?: LogContext): void;
  verbose(message: any, context?: string): void;
  verbose(
    message: any,
    metaOrContext?: Record<string, unknown> | string,
    context?: LogContext,
  ): void {
    if (typeof metaOrContext === 'string') {
      // LoggerService signature: verbose?(message, context?)
      this.baseLogger.verbose(message, undefined, metaOrContext || this.context);
    } else {
      // ILogger signature: verbose(message, meta?, context?)
      this.baseLogger.verbose(message, metaOrContext, context || this.context);
    }
  }

  fatal(message: string, meta?: Record<string, unknown>, context?: LogContext): void {
    this.baseLogger.fatal(message, meta, context || this.context);
  }

  setContext(_context: string): void {
    // This method exists for compatibility but doesn't change the bound context
    // The context is immutable once the logger is created
  }

  getContext(): string {
    return this.context;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

@Injectable()
export class LoggerFactory {
  constructor(private readonly baseLogger: CustomLogger) {}

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
