export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogContextObject {
  requestId?: string;
  userId?: string;
  userEmail?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  [key: string]: unknown;
}

export type LogContext = string | LogContextObject;

export interface LogMetadata {
  context?: string;
  timestamp?: string;
  level?: LogLevel;
  stack?: string;
  [key: string]: unknown;
}

export interface ILogger {
  log(message: string, context?: string): void;
  error(message: string, error?: Error | unknown, context?: LogContext): void;
  warn(message: string, meta?: Record<string, unknown>, context?: LogContext): void;
  info(message: string, meta?: Record<string, unknown>, context?: LogContext): void;
  debug(message: string, meta?: Record<string, unknown>, context?: LogContext): void;
  verbose(message: string, meta?: Record<string, unknown>, context?: LogContext): void;
  fatal(message: string, meta?: Record<string, unknown>, context?: LogContext): void;
  setContext(context: string): void;
  getContext(): string;
}
