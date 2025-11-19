import { registerAs } from '@nestjs/config';

export interface LoggerConfig {
  level: string;
  prettyPrint: boolean;
  fileEnabled: boolean;
  filePath: string;
}

const VALID_LOG_LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const;
type ValidLogLevel = (typeof VALID_LOG_LEVELS)[number];

function isValidLogLevel(level: string): level is ValidLogLevel {
  return VALID_LOG_LEVELS.includes(level as ValidLogLevel);
}

export default registerAs('logger', (): LoggerConfig => {
  const level = process.env.LOG_LEVEL || 'info';

  // Validate log level
  if (!isValidLogLevel(level)) {
    console.warn(`Invalid LOG_LEVEL "${level}", defaulting to "info"`);
  }

  // Determine pretty print setting with explicit override support
  let prettyPrint: boolean;
  if (process.env.LOG_PRETTY_PRINT === 'true') {
    prettyPrint = true;
  } else if (process.env.LOG_PRETTY_PRINT === 'false') {
    prettyPrint = false;
  } else {
    prettyPrint = process.env.NODE_ENV !== 'production';
  }

  return {
    level: isValidLogLevel(level) ? level : 'info',
    prettyPrint,
    fileEnabled: process.env.LOG_FILE_ENABLED === 'true',
    filePath: process.env.LOG_FILE_PATH || './logs',
  };
});
