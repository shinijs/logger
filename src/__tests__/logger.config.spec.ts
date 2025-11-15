import loggerConfig from '../logger.config';

describe('loggerConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe('Default Configuration', () => {
    it('should have correct key', () => {
      expect(loggerConfig.KEY).toBe('CONFIGURATION(logger)');
    });

    it('should return default config when no environment variables are set', () => {
      delete process.env.LOG_LEVEL;
      delete process.env.NODE_ENV;
      delete process.env.LOG_FILE_ENABLED;
      delete process.env.LOG_FILE_PATH;

      const config = loggerConfig();
      expect(config).toEqual({
        level: 'info',
        prettyPrint: true,
        fileEnabled: false,
        filePath: './logs',
      });
    });
  });

  describe('LOG_LEVEL Environment Variable', () => {
    it('should use LOG_LEVEL when set', () => {
      process.env.LOG_LEVEL = 'debug';
      const config = loggerConfig();
      expect(config.level).toBe('debug');
    });

    it('should use default "info" when LOG_LEVEL is not set', () => {
      delete process.env.LOG_LEVEL;
      const config = loggerConfig();
      expect(config.level).toBe('info');
    });

    it('should handle different log levels', () => {
      const levels = ['error', 'warn', 'info', 'debug', 'trace'];
      levels.forEach((level) => {
        process.env.LOG_LEVEL = level;
        const config = loggerConfig();
        expect(config.level).toBe(level);
      });
    });
  });

  describe('NODE_ENV Environment Variable', () => {
    it('should set prettyPrint to false when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';
      const config = loggerConfig();
      expect(config.prettyPrint).toBe(false);
    });

    it('should set prettyPrint to true when NODE_ENV is not production', () => {
      process.env.NODE_ENV = 'development';
      const config = loggerConfig();
      expect(config.prettyPrint).toBe(true);
    });

    it('should set prettyPrint to true when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test';
      const config = loggerConfig();
      expect(config.prettyPrint).toBe(true);
    });

    it('should set prettyPrint to true when NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;
      const config = loggerConfig();
      expect(config.prettyPrint).toBe(true);
    });
  });

  describe('LOG_FILE_ENABLED Environment Variable', () => {
    it('should set fileEnabled to true when LOG_FILE_ENABLED is "true"', () => {
      process.env.LOG_FILE_ENABLED = 'true';
      const config = loggerConfig();
      expect(config.fileEnabled).toBe(true);
    });

    it('should set fileEnabled to false when LOG_FILE_ENABLED is not "true"', () => {
      process.env.LOG_FILE_ENABLED = 'false';
      const config = loggerConfig();
      expect(config.fileEnabled).toBe(false);
    });

    it('should set fileEnabled to false when LOG_FILE_ENABLED is not set', () => {
      delete process.env.LOG_FILE_ENABLED;
      const config = loggerConfig();
      expect(config.fileEnabled).toBe(false);
    });

    it('should set fileEnabled to false when LOG_FILE_ENABLED is empty string', () => {
      process.env.LOG_FILE_ENABLED = '';
      const config = loggerConfig();
      expect(config.fileEnabled).toBe(false);
    });
  });

  describe('LOG_FILE_PATH Environment Variable', () => {
    it('should use LOG_FILE_PATH when set', () => {
      process.env.LOG_FILE_PATH = '/custom/logs';
      const config = loggerConfig();
      expect(config.filePath).toBe('/custom/logs');
    });

    it('should use default "./logs" when LOG_FILE_PATH is not set', () => {
      delete process.env.LOG_FILE_PATH;
      const config = loggerConfig();
      expect(config.filePath).toBe('./logs');
    });

    it('should handle relative paths', () => {
      process.env.LOG_FILE_PATH = '../logs';
      const config = loggerConfig();
      expect(config.filePath).toBe('../logs');
    });

    it('should handle absolute paths', () => {
      process.env.LOG_FILE_PATH = '/var/log/app';
      const config = loggerConfig();
      expect(config.filePath).toBe('/var/log/app');
    });
  });

  describe('Configuration Registration', () => {
    it('should be registered with registerAs', () => {
      expect(loggerConfig).toBeDefined();
      expect(typeof loggerConfig).toBe('function');
      expect(loggerConfig.KEY).toBeDefined();
    });

    it('should return LoggerConfig type', () => {
      const config = loggerConfig();
      expect(config).toHaveProperty('level');
      expect(config).toHaveProperty('prettyPrint');
      expect(config).toHaveProperty('fileEnabled');
      expect(config).toHaveProperty('filePath');
      expect(typeof config.level).toBe('string');
      expect(typeof config.prettyPrint).toBe('boolean');
      expect(typeof config.fileEnabled).toBe('boolean');
      expect(typeof config.filePath).toBe('string');
    });
  });

  describe('Combined Environment Variables', () => {
    it('should handle all environment variables together', () => {
      process.env.LOG_LEVEL = 'warn';
      process.env.NODE_ENV = 'production';
      process.env.LOG_FILE_ENABLED = 'true';
      process.env.LOG_FILE_PATH = '/app/logs';

      const config = loggerConfig();
      expect(config).toEqual({
        level: 'warn',
        prettyPrint: false,
        fileEnabled: true,
        filePath: '/app/logs',
      });
    });

    it('should handle production with file logging', () => {
      process.env.NODE_ENV = 'production';
      process.env.LOG_FILE_ENABLED = 'true';
      process.env.LOG_FILE_PATH = '/var/log';

      const config = loggerConfig();
      expect(config.prettyPrint).toBe(false);
      expect(config.fileEnabled).toBe(true);
      expect(config.filePath).toBe('/var/log');
    });

    it('should handle development without file logging', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.LOG_FILE_ENABLED;

      const config = loggerConfig();
      expect(config.prettyPrint).toBe(true);
      expect(config.fileEnabled).toBe(false);
    });
  });
});
