import { Injectable, Inject, LoggerService } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import pino from 'pino';
import pinoPretty from 'pino-pretty';
import { ILogger, LogContext } from './logger.interface';
import loggerConfig from './logger.config';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class CustomLogger implements ILogger, LoggerService {
  private readonly pino: pino.Logger;
  private context: string = 'Application';

  constructor(
    @Inject(loggerConfig.KEY)
    private readonly config: ConfigType<typeof loggerConfig>,
  ) {
    this.pino = this.createPinoLogger();
  }

  private createPinoLogger(): pino.Logger {
    const pinoOptions: pino.LoggerOptions = {
      level: this.config.level,
    };

    // Pretty print in development (synchronous for better compatibility with NestJS)
    if (this.config.prettyPrint) {
      const prettyStream = pinoPretty({
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
        singleLine: false,
        levelFirst: true,
        messageFormat: '{context} {msg}',
      });

      return pino(pinoOptions, prettyStream);
    }

    // Production or file logging
    const targets: pino.TransportTargetOptions[] = [];

    targets.push({
      target: 'pino/file',
      level: this.config.level,
      options: { destination: 1 }, // stdout
    });

    // File transport if enabled
    if (this.config.fileEnabled) {
      const logDir = this.config.filePath;
      if (!existsSync(logDir)) {
        mkdirSync(logDir, { recursive: true });
      }

      targets.push({
        target: 'pino/file',
        level: this.config.level,
        options: {
          destination: join(logDir, 'app.log'),
          mkdir: true,
        },
      });
    }

    return pino({
      ...pinoOptions,
      transport: {
        targets,
      },
    });
  }

  setContext(context: string): void {
    this.context = context;
  }

  getContext(): string {
    return this.context;
  }

  private formatMessage(message: string, context?: LogContext): Record<string, unknown> {
    const logObj: Record<string, unknown> = {
      message,
    };

    if (typeof context === 'string') {
      logObj.context = context;
    } else if (typeof context === 'object' && context !== null) {
      Object.assign(logObj, context);
      if (!logObj.context) {
        logObj.context = this.context;
      }
    } else {
      logObj.context = this.context;
    }

    return logObj;
  }

  log(message: string, context?: string): void {
    this.info(message, undefined, context);
  }

  error(message: string, trace?: unknown, context?: LogContext): void {
    const logObj = this.formatMessage(message, context);
    if (trace instanceof Error) {
      this.pino.error({ ...logObj, err: trace }, message);
    } else if (trace) {
      this.pino.error({ ...logObj, trace }, message);
    } else {
      this.pino.error(logObj, message);
    }
  }

  warn(message: string, meta?: Record<string, unknown>, context?: LogContext): void {
    const logObj = this.formatMessage(message, context);
    this.pino.warn({ ...logObj, ...meta }, message);
  }

  debug(message: string, meta?: Record<string, unknown>, context?: LogContext): void {
    const logObj = this.formatMessage(message, context);
    this.pino.debug({ ...logObj, ...meta }, message);
  }

  verbose(message: string, meta?: Record<string, unknown>, context?: LogContext): void {
    const logObj = this.formatMessage(message, context);
    this.pino.trace({ ...logObj, ...meta }, message);
  }

  info(message: string, meta?: Record<string, unknown>, context?: LogContext): void {
    const logObj = this.formatMessage(message, context);
    this.pino.info({ ...logObj, ...meta }, message);
  }

  fatal(message: string, meta?: Record<string, unknown>, context?: LogContext): void {
    const logObj = this.formatMessage(message, context);
    this.pino.fatal({ ...logObj, ...meta }, message);
  }
}
