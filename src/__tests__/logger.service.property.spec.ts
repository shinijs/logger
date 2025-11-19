import * as fc from 'fast-check';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import pino from 'pino';
import pinoPretty from 'pino-pretty';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { CustomLogger } from '../logger.service';
import loggerConfig from '../logger.config';

// Mock pino and pino-pretty
jest.mock('pino');
jest.mock('pino-pretty');
jest.mock('fs');

describe('CustomLogger Property-Based Tests', () => {
  let mockPinoLogger: jest.Mocked<pino.Logger>;
  let mockPinoPretty: jest.Mock;
  let mockExistsSync: jest.Mock;
  let mockMkdirSync: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPinoLogger = {
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      trace: jest.fn(),
      fatal: jest.fn(),
    } as unknown as jest.Mocked<pino.Logger>;

    mockPinoPretty = pinoPretty as unknown as jest.Mock;
    mockPinoPretty.mockReturnValue({});

    (pino as unknown as jest.Mock).mockReturnValue(mockPinoLogger);

    mockExistsSync = existsSync as jest.Mock;
    mockMkdirSync = mkdirSync as jest.Mock;
    mockExistsSync.mockReturnValue(true);
    mockMkdirSync.mockImplementation(() => {});
  });

  /**
   * Feature: log-file-rotation, Property 6: Rotation options match configuration
   * Validates: Requirements 1.2, 1.4, 1.5
   *
   * When rotation is enabled, the options passed to pino-roll should exactly match
   * the values from LoggerConfig (file path, frequency, dateFormat, maxFiles, size).
   */
  describe('Property 6: Rotation options match configuration', () => {
    it('should return rotation options that exactly match LoggerConfig values', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            filePath: fc.oneof(
              fc.constant('./logs'),
              fc.constant('/var/log/app'),
              fc.constant('./test-logs'),
              fc.constant('/tmp/logs'),
            ),
            fileRotationFrequency: fc.constantFrom('daily', 'hourly', 'custom'),
            fileRotationPattern: fc.oneof(
              fc.constant('YYYY-MM-DD'),
              fc.constant('YYYY-MM-DD-HH'),
              fc.constant('YYYY-MM'),
            ),
            fileMaxFiles: fc.integer({ min: 1, max: 100 }),
            fileSizeLimit: fc.oneof(
              fc.nat({ max: 100 }).map((n) => `${n}M`),
              fc.nat({ max: 5 }).map((n) => `${n}G`),
            ),
          }),
          async (rotationConfig) => {
            const config = {
              level: 'info',
              prettyPrint: false,
              fileEnabled: true,
              filePath: rotationConfig.filePath,
              fileRotationEnabled: true,
              fileRotationFrequency: rotationConfig.fileRotationFrequency,
              fileRotationPattern: rotationConfig.fileRotationPattern,
              fileMaxFiles: rotationConfig.fileMaxFiles,
              fileSizeLimit: rotationConfig.fileSizeLimit,
            };

            const module: TestingModule = await Test.createTestingModule({
              imports: [ConfigModule.forFeature(loggerConfig)],
              providers: [
                {
                  provide: loggerConfig.KEY,
                  useValue: config,
                },
                CustomLogger,
              ],
            }).compile();

            const logger = module.get<CustomLogger>(CustomLogger);
            const options = (logger as any).getRotationOptions();

            // Verify all options match the configuration
            expect(options.file).toBe(join(rotationConfig.filePath, 'app'));
            expect(options.frequency).toBe(rotationConfig.fileRotationFrequency);
            expect(options.dateFormat).toBe(rotationConfig.fileRotationPattern);
            expect(options.maxFiles).toBe(rotationConfig.fileMaxFiles);
            expect(options.size).toBe(rotationConfig.fileSizeLimit);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
