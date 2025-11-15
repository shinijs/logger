import { registerAs } from '@nestjs/config';

export interface LoggerConfig {
  level: string;
  prettyPrint: boolean;
  fileEnabled: boolean;
  filePath: string;
}

export default registerAs(
  'logger',
  (): LoggerConfig => ({
    level: process.env.LOG_LEVEL || 'info',
    prettyPrint: process.env.NODE_ENV !== 'production',
    fileEnabled: process.env.LOG_FILE_ENABLED === 'true',
    filePath: process.env.LOG_FILE_PATH || './logs',
  }),
);
