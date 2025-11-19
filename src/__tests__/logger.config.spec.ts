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
      delete process.env.LOG_FILE_ROTATION_ENABLED;
      delete process.env.LOG_FILE_ROTATION_FREQUENCY;
      delete process.env.LOG_FILE_ROTATION_PATTERN;
      delete process.env.LOG_FILE_MAX_FILES;
      delete process.env.LOG_FILE_SIZE_LIMIT;

      const config = loggerConfig();
      expect(config).toEqual({
        level: 'info',
        prettyPrint: true,
        fileEnabled: false,
        filePath: './logs',
        fileRotationEnabled: false,
        fileRotationFrequency: 'daily',
        fileRotationPattern: 'YYYY-MM-DD',
        fileMaxFiles: 7,
        fileSizeLimit: '10M',
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
      expect(config.level).toBe('warn');
      expect(config.prettyPrint).toBe(false);
      expect(config.fileEnabled).toBe(true);
      expect(config.filePath).toBe('/app/logs');
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

  describe('LOG_FILE_ROTATION_ENABLED Environment Variable', () => {
    it('should enable rotation by default when file logging is enabled', () => {
      process.env.LOG_FILE_ENABLED = 'true';
      delete process.env.LOG_FILE_ROTATION_ENABLED;

      const config = loggerConfig();
      expect(config.fileRotationEnabled).toBe(true);
    });

    it('should disable rotation when explicitly set to false', () => {
      process.env.LOG_FILE_ENABLED = 'true';
      process.env.LOG_FILE_ROTATION_ENABLED = 'false';

      const config = loggerConfig();
      expect(config.fileRotationEnabled).toBe(false);
    });

    it('should disable rotation when file logging is disabled', () => {
      delete process.env.LOG_FILE_ENABLED;
      delete process.env.LOG_FILE_ROTATION_ENABLED;

      const config = loggerConfig();
      expect(config.fileRotationEnabled).toBe(false);
    });

    it('should enable rotation when set to true', () => {
      process.env.LOG_FILE_ENABLED = 'true';
      process.env.LOG_FILE_ROTATION_ENABLED = 'true';

      const config = loggerConfig();
      expect(config.fileRotationEnabled).toBe(true);
    });
  });

  describe('LOG_FILE_ROTATION_FREQUENCY Environment Variable', () => {
    it('should use default "daily" when not set', () => {
      const config = loggerConfig();
      expect(config.fileRotationFrequency).toBe('daily');
    });

    it('should use "daily" when explicitly set', () => {
      process.env.LOG_FILE_ROTATION_FREQUENCY = 'daily';
      const config = loggerConfig();
      expect(config.fileRotationFrequency).toBe('daily');
    });

    it('should use "hourly" when set', () => {
      process.env.LOG_FILE_ROTATION_FREQUENCY = 'hourly';
      const config = loggerConfig();
      expect(config.fileRotationFrequency).toBe('hourly');
    });

    it('should use "custom" when set', () => {
      process.env.LOG_FILE_ROTATION_FREQUENCY = 'custom';
      const config = loggerConfig();
      expect(config.fileRotationFrequency).toBe('custom');
    });

    it('should fall back to "daily" for invalid frequency', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      process.env.LOG_FILE_ROTATION_FREQUENCY = 'weekly';

      const config = loggerConfig();
      expect(config.fileRotationFrequency).toBe('daily');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid LOG_FILE_ROTATION_FREQUENCY "weekly", defaulting to "daily"',
      );

      consoleSpy.mockRestore();
    });
  });

  describe('LOG_FILE_ROTATION_PATTERN Environment Variable', () => {
    it('should use default "YYYY-MM-DD" when not set', () => {
      delete process.env.LOG_FILE_ROTATION_PATTERN;
      const config = loggerConfig();
      expect(config.fileRotationPattern).toBe('YYYY-MM-DD');
    });

    it('should use custom pattern when set', () => {
      process.env.LOG_FILE_ROTATION_PATTERN = 'YYYY-MM-DD-HH';
      const config = loggerConfig();
      expect(config.fileRotationPattern).toBe('YYYY-MM-DD-HH');
    });

    it('should accept any string pattern', () => {
      process.env.LOG_FILE_ROTATION_PATTERN = 'custom-pattern';
      const config = loggerConfig();
      expect(config.fileRotationPattern).toBe('custom-pattern');
    });
  });

  describe('LOG_FILE_MAX_FILES Environment Variable', () => {
    it('should use default 7 when not set', () => {
      delete process.env.LOG_FILE_MAX_FILES;
      const config = loggerConfig();
      expect(config.fileMaxFiles).toBe(7);
    });

    it('should parse valid integer', () => {
      process.env.LOG_FILE_MAX_FILES = '14';
      const config = loggerConfig();
      expect(config.fileMaxFiles).toBe(14);
    });

    it('should parse single digit', () => {
      process.env.LOG_FILE_MAX_FILES = '5';
      const config = loggerConfig();
      expect(config.fileMaxFiles).toBe(5);
    });

    it('should fall back to 7 for invalid integer', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      process.env.LOG_FILE_MAX_FILES = 'not-a-number';

      const config = loggerConfig();
      expect(config.fileMaxFiles).toBe(7);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid LOG_FILE_MAX_FILES "not-a-number", defaulting to 7',
      );

      consoleSpy.mockRestore();
    });

    it('should fall back to 7 for negative numbers', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      process.env.LOG_FILE_MAX_FILES = '-5';

      const config = loggerConfig();
      expect(config.fileMaxFiles).toBe(7);
      expect(consoleSpy).toHaveBeenCalledWith('Invalid LOG_FILE_MAX_FILES "-5", defaulting to 7');

      consoleSpy.mockRestore();
    });

    it('should fall back to 7 for zero', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      process.env.LOG_FILE_MAX_FILES = '0';

      const config = loggerConfig();
      expect(config.fileMaxFiles).toBe(7);
      expect(consoleSpy).toHaveBeenCalledWith('Invalid LOG_FILE_MAX_FILES "0", defaulting to 7');

      consoleSpy.mockRestore();
    });
  });

  describe('LOG_FILE_SIZE_LIMIT Environment Variable', () => {
    it('should use default "10M" when not set', () => {
      delete process.env.LOG_FILE_SIZE_LIMIT;
      const config = loggerConfig();
      expect(config.fileSizeLimit).toBe('10M');
    });

    it('should use custom size limit when set', () => {
      process.env.LOG_FILE_SIZE_LIMIT = '50M';
      const config = loggerConfig();
      expect(config.fileSizeLimit).toBe('50M');
    });

    it('should accept different size formats', () => {
      process.env.LOG_FILE_SIZE_LIMIT = '1G';
      const config = loggerConfig();
      expect(config.fileSizeLimit).toBe('1G');
    });
  });

  describe('Rotation Configuration Integration', () => {
    it('should handle all rotation settings together', () => {
      process.env.LOG_FILE_ENABLED = 'true';
      process.env.LOG_FILE_ROTATION_ENABLED = 'true';
      process.env.LOG_FILE_ROTATION_FREQUENCY = 'hourly';
      process.env.LOG_FILE_ROTATION_PATTERN = 'YYYY-MM-DD-HH';
      process.env.LOG_FILE_MAX_FILES = '24';
      process.env.LOG_FILE_SIZE_LIMIT = '100M';

      const config = loggerConfig();
      expect(config.fileRotationEnabled).toBe(true);
      expect(config.fileRotationFrequency).toBe('hourly');
      expect(config.fileRotationPattern).toBe('YYYY-MM-DD-HH');
      expect(config.fileMaxFiles).toBe(24);
      expect(config.fileSizeLimit).toBe('100M');
    });

    it('should use defaults for rotation when file logging enabled but rotation settings not provided', () => {
      process.env.LOG_FILE_ENABLED = 'true';
      delete process.env.LOG_FILE_ROTATION_ENABLED;
      delete process.env.LOG_FILE_ROTATION_FREQUENCY;
      delete process.env.LOG_FILE_ROTATION_PATTERN;
      delete process.env.LOG_FILE_MAX_FILES;
      delete process.env.LOG_FILE_SIZE_LIMIT;

      const config = loggerConfig();
      expect(config.fileRotationEnabled).toBe(true);
      expect(config.fileRotationFrequency).toBe('daily');
      expect(config.fileRotationPattern).toBe('YYYY-MM-DD');
      expect(config.fileMaxFiles).toBe(7);
      expect(config.fileSizeLimit).toBe('10M');
    });
  });
});
