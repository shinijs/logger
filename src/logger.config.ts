import { registerAs } from '@nestjs/config';

export interface LoggerConfig {
  level: string;
  prettyPrint: boolean;
  fileEnabled: boolean;
  filePath: string;
  fileRotationEnabled: boolean;
  fileRotationFrequency: 'daily' | 'hourly' | 'custom';
  fileRotationPattern: string;
  fileMaxFiles: number;
  fileSizeLimit: string;
}

const VALID_LOG_LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const;
type ValidLogLevel = (typeof VALID_LOG_LEVELS)[number];

function isValidLogLevel(level: string): level is ValidLogLevel {
  return VALID_LOG_LEVELS.includes(level as ValidLogLevel);
}

const VALID_ROTATION_FREQUENCIES = ['daily', 'hourly', 'custom'] as const;
type ValidRotationFrequency = (typeof VALID_ROTATION_FREQUENCIES)[number];

function isValidRotationFrequency(frequency: string): frequency is ValidRotationFrequency {
  return VALID_ROTATION_FREQUENCIES.includes(frequency as ValidRotationFrequency);
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

  const fileEnabled = process.env.LOG_FILE_ENABLED === 'true';
  const filePath = process.env.LOG_FILE_PATH || './logs';

  // Parse rotation settings
  let fileRotationEnabled: boolean;
  if (process.env.LOG_FILE_ROTATION_ENABLED === 'false') {
    fileRotationEnabled = false;
  } else {
    // Default: enable rotation when file logging is enabled
    fileRotationEnabled = fileEnabled;
  }

  // Parse rotation frequency with validation
  const rotationFrequencyEnv = process.env.LOG_FILE_ROTATION_FREQUENCY || 'daily';
  let fileRotationFrequency: ValidRotationFrequency;
  if (isValidRotationFrequency(rotationFrequencyEnv)) {
    fileRotationFrequency = rotationFrequencyEnv;
  } else {
    console.warn(
      `Invalid LOG_FILE_ROTATION_FREQUENCY "${rotationFrequencyEnv}", defaulting to "daily"`,
    );
    fileRotationFrequency = 'daily';
  }

  // Parse rotation pattern
  const fileRotationPattern = process.env.LOG_FILE_ROTATION_PATTERN || 'YYYY-MM-DD';

  // Parse maxFiles with validation
  const maxFilesEnv = process.env.LOG_FILE_MAX_FILES;
  let fileMaxFiles: number;
  if (maxFilesEnv) {
    const parsed = parseInt(maxFilesEnv, 10);
    if (isNaN(parsed) || parsed <= 0) {
      console.warn(`Invalid LOG_FILE_MAX_FILES "${maxFilesEnv}", defaulting to 7`);
      fileMaxFiles = 7;
    } else {
      fileMaxFiles = parsed;
    }
  } else {
    fileMaxFiles = 7;
  }

  // Parse size limit
  const fileSizeLimit = process.env.LOG_FILE_SIZE_LIMIT || '10M';

  return {
    level: isValidLogLevel(level) ? level : 'info',
    prettyPrint,
    fileEnabled,
    filePath,
    fileRotationEnabled,
    fileRotationFrequency,
    fileRotationPattern,
    fileMaxFiles,
    fileSizeLimit,
  };
});
