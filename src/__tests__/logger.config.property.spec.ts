import * as fc from 'fast-check';
import loggerConfig from '../logger.config';

describe('loggerConfig Property-Based Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  /**
   * Feature: log-file-rotation, Property 2: Configuration parsing preserves values
   * Validates: Requirements 2.2, 2.3, 2.4, 2.5
   *
   * For any valid environment variable value for rotation settings (frequency, pattern, maxFiles, sizeLimit),
   * parsing the configuration should result in that exact value appearing in the LoggerConfig object.
   */
  describe('Property 2: Configuration parsing preserves values', () => {
    it('should preserve valid rotation frequency values', () => {
      fc.assert(
        fc.property(fc.constantFrom('daily', 'hourly', 'custom'), (frequency) => {
          process.env.LOG_FILE_ROTATION_FREQUENCY = frequency;
          const config = loggerConfig();
          expect(config.fileRotationFrequency).toBe(frequency);
        }),
        { numRuns: 100 },
      );
    });

    it('should preserve valid rotation pattern values', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('YYYY-MM-DD'),
            fc.constant('YYYY-MM-DD-HH'),
            fc.constant('YYYY-MM'),
            fc.stringMatching(/^[A-Z-]+$/),
          ),
          (pattern) => {
            process.env.LOG_FILE_ROTATION_PATTERN = pattern;
            const config = loggerConfig();
            expect(config.fileRotationPattern).toBe(pattern);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should preserve valid maxFiles integer values', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 1000 }), (maxFiles) => {
          process.env.LOG_FILE_MAX_FILES = maxFiles.toString();
          const config = loggerConfig();
          expect(config.fileMaxFiles).toBe(maxFiles);
        }),
        { numRuns: 100 },
      );
    });

    it('should preserve valid size limit values', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.nat({ max: 1000 }).map((n) => `${n}M`),
            fc.nat({ max: 10 }).map((n) => `${n}G`),
            fc.nat({ max: 1000000 }).map((n) => `${n}K`),
          ),
          (sizeLimit) => {
            process.env.LOG_FILE_SIZE_LIMIT = sizeLimit;
            const config = loggerConfig();
            expect(config.fileSizeLimit).toBe(sizeLimit);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});

/**
 * Feature: log-file-rotation, Property 3: Invalid configuration falls back to defaults
 * Validates: Requirements 7.4
 *
 * For any invalid configuration value (non-numeric maxFiles, invalid frequency, etc.),
 * the configuration should use the default value and the system should continue to function.
 */
describe('Property 3: Invalid configuration falls back to defaults', () => {
  it('should fall back to default frequency for invalid frequency values', () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => !['daily', 'hourly', 'custom'].includes(s)),
        (invalidFrequency) => {
          const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
          process.env.LOG_FILE_ROTATION_FREQUENCY = invalidFrequency;

          const config = loggerConfig();
          expect(config.fileRotationFrequency).toBe('daily');

          consoleSpy.mockRestore();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should fall back to default maxFiles for non-numeric values', () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => isNaN(parseInt(s, 10))),
        (invalidMaxFiles) => {
          const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
          process.env.LOG_FILE_MAX_FILES = invalidMaxFiles;

          const config = loggerConfig();
          expect(config.fileMaxFiles).toBe(7);

          consoleSpy.mockRestore();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should fall back to default maxFiles for negative or zero values', () => {
    fc.assert(
      fc.property(fc.integer({ max: 0 }), (invalidMaxFiles) => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        process.env.LOG_FILE_MAX_FILES = invalidMaxFiles.toString();

        const config = loggerConfig();
        expect(config.fileMaxFiles).toBe(7);

        consoleSpy.mockRestore();
      }),
      { numRuns: 100 },
    );
  });

  it('should not crash with any invalid configuration combination', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string(),
        fc.string(),
        (invalidFreq, invalidMaxFiles, invalidPattern) => {
          const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
          process.env.LOG_FILE_ROTATION_FREQUENCY = invalidFreq;
          process.env.LOG_FILE_MAX_FILES = invalidMaxFiles;
          process.env.LOG_FILE_ROTATION_PATTERN = invalidPattern;

          // Should not throw
          expect(() => loggerConfig()).not.toThrow();

          const config = loggerConfig();
          // Should have valid config object
          expect(config).toBeDefined();
          expect(typeof config.fileRotationFrequency).toBe('string');
          expect(typeof config.fileMaxFiles).toBe('number');
          expect(typeof config.fileRotationPattern).toBe('string');

          consoleSpy.mockRestore();
        },
      ),
      { numRuns: 100 },
    );
  });
});

/**
 * Feature: log-file-rotation, Property 1: Rotation enabled by default with file logging
 * Validates: Requirements 1.1, 4.1, 6.5
 *
 * When file logging is enabled and no explicit rotation setting is provided,
 * the logger configuration should enable rotation by default.
 */
describe('Property 1: Rotation enabled by default with file logging', () => {
  it('should enable rotation when file logging is enabled and rotation not explicitly set', () => {
    fc.assert(
      fc.property(fc.boolean(), (_rotationUndefined) => {
        process.env.LOG_FILE_ENABLED = 'true';
        delete process.env.LOG_FILE_ROTATION_ENABLED;

        const config = loggerConfig();
        expect(config.fileRotationEnabled).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it('should disable rotation when file logging is disabled regardless of rotation setting', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('false', '', undefined),
        fc.oneof(fc.constant('true'), fc.constant('false'), fc.constant(undefined)),
        (fileEnabled, rotationEnabled) => {
          if (fileEnabled === undefined) {
            delete process.env.LOG_FILE_ENABLED;
          } else {
            process.env.LOG_FILE_ENABLED = fileEnabled;
          }

          if (rotationEnabled === undefined) {
            delete process.env.LOG_FILE_ROTATION_ENABLED;
          } else {
            process.env.LOG_FILE_ROTATION_ENABLED = rotationEnabled;
          }

          const config = loggerConfig();
          expect(config.fileRotationEnabled).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should respect explicit rotation disabled even when file logging is enabled', () => {
    fc.assert(
      fc.property(fc.boolean(), (_someValue) => {
        process.env.LOG_FILE_ENABLED = 'true';
        process.env.LOG_FILE_ROTATION_ENABLED = 'false';

        const config = loggerConfig();
        expect(config.fileRotationEnabled).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});

/**
 * Feature: log-file-rotation, Property 7: Default configuration values
 * Validates: Requirements 3.3, 6.1, 6.2, 6.3, 6.4
 *
 * When no environment variables are set for rotation settings,
 * the configuration should use these defaults: frequency='daily', pattern='YYYY-MM-DD', maxFiles=7, sizeLimit='10M'.
 */
describe('Property 7: Default configuration values', () => {
  it('should use default values when no rotation environment variables are set', () => {
    fc.assert(
      fc.property(fc.boolean(), (_someValue) => {
        // Clear all rotation-related environment variables
        delete process.env.LOG_FILE_ROTATION_FREQUENCY;
        delete process.env.LOG_FILE_ROTATION_PATTERN;
        delete process.env.LOG_FILE_MAX_FILES;
        delete process.env.LOG_FILE_SIZE_LIMIT;

        const config = loggerConfig();
        expect(config.fileRotationFrequency).toBe('daily');
        expect(config.fileRotationPattern).toBe('YYYY-MM-DD');
        expect(config.fileMaxFiles).toBe(7);
        expect(config.fileSizeLimit).toBe('10M');
      }),
      { numRuns: 100 },
    );
  });

  it('should use defaults for any subset of missing rotation variables', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        (setFreq, setPattern, setMaxFiles, setSizeLimit) => {
          // Randomly set or unset each variable
          if (setFreq) {
            process.env.LOG_FILE_ROTATION_FREQUENCY = 'hourly';
          } else {
            delete process.env.LOG_FILE_ROTATION_FREQUENCY;
          }

          if (setPattern) {
            process.env.LOG_FILE_ROTATION_PATTERN = 'YYYY-MM-DD-HH';
          } else {
            delete process.env.LOG_FILE_ROTATION_PATTERN;
          }

          if (setMaxFiles) {
            process.env.LOG_FILE_MAX_FILES = '14';
          } else {
            delete process.env.LOG_FILE_MAX_FILES;
          }

          if (setSizeLimit) {
            process.env.LOG_FILE_SIZE_LIMIT = '50M';
          } else {
            delete process.env.LOG_FILE_SIZE_LIMIT;
          }

          const config = loggerConfig();

          // Check that unset values use defaults
          if (!setFreq) {
            expect(config.fileRotationFrequency).toBe('daily');
          }
          if (!setPattern) {
            expect(config.fileRotationPattern).toBe('YYYY-MM-DD');
          }
          if (!setMaxFiles) {
            expect(config.fileMaxFiles).toBe(7);
          }
          if (!setSizeLimit) {
            expect(config.fileSizeLimit).toBe('10M');
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
