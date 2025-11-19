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

  /**
   * Feature: log-file-rotation, Property 5: Multi-stream configuration with pretty print and rotation
   * Validates: Requirements 4.4, 5.1
   *
   * When both pretty printing and file rotation are enabled, the transport configuration
   * should include both pino-pretty and pino-roll targets.
   */
  describe('Property 5: Multi-stream configuration with pretty print and rotation', () => {
    it('should include both pino-pretty and pino-roll targets when both are enabled', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            filePath: fc.oneof(
              fc.constant('./logs'),
              fc.constant('/var/log/app'),
              fc.constant('./test-logs'),
              fc.constant('/tmp/logs'),
            ),
            level: fc.constantFrom('trace', 'debug', 'info', 'warn', 'error', 'fatal'),
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
          async (testConfig) => {
            const config = {
              level: testConfig.level,
              prettyPrint: true,
              fileEnabled: true,
              filePath: testConfig.filePath,
              fileRotationEnabled: true,
              fileRotationFrequency: testConfig.fileRotationFrequency,
              fileRotationPattern: testConfig.fileRotationPattern,
              fileMaxFiles: testConfig.fileMaxFiles,
              fileSizeLimit: testConfig.fileSizeLimit,
            };

            // Clear previous calls
            (pino as unknown as jest.Mock).mockClear();

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

            await module.get<CustomLogger>(CustomLogger);

            // Verify pino was called with multi-stream transport
            expect(pino).toHaveBeenCalledWith(
              expect.objectContaining({
                level: testConfig.level,
                transport: expect.objectContaining({
                  targets: expect.any(Array),
                }),
              }),
            );

            const pinoCall = (pino as unknown as jest.Mock).mock.calls[0][0];
            const targets = pinoCall.transport.targets;

            // Verify we have exactly 2 targets
            expect(targets).toHaveLength(2);

            // Verify pino-pretty target exists
            const prettyTarget = targets.find((t: any) => t.target === 'pino-pretty');
            expect(prettyTarget).toBeDefined();
            expect(prettyTarget.level).toBe(testConfig.level);
            expect(prettyTarget.options).toMatchObject({
              colorize: true,
              translateTime: 'HH:MM:ss',
              ignore: 'pid,hostname',
              singleLine: false,
              levelFirst: true,
              messageFormat: '{context} {msg}',
            });

            // Verify pino-roll target exists
            const rollTarget = targets.find((t: any) => t.target === 'pino-roll');
            expect(rollTarget).toBeDefined();
            expect(rollTarget.level).toBe(testConfig.level);
            expect(rollTarget.options).toMatchObject({
              file: join(testConfig.filePath, 'app'),
              frequency: testConfig.fileRotationFrequency,
              dateFormat: testConfig.fileRotationPattern,
              maxFiles: testConfig.fileMaxFiles,
              size: testConfig.fileSizeLimit,
            });
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Feature: log-file-rotation, Property 4: Rotation disabled uses single file transport
   * Validates: Requirements 2.1, 4.3
   *
   * When LOG_FILE_ROTATION_ENABLED is explicitly set to false, the file transport
   * configuration should use pino/file target with destination app.log instead of pino-roll.
   */
  describe('Property 4: Rotation disabled uses single file transport', () => {
    it('should use pino/file transport with app.log destination when rotation is disabled', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            filePath: fc.oneof(
              fc.constant('./logs'),
              fc.constant('/var/log/app'),
              fc.constant('./test-logs'),
              fc.constant('/tmp/logs'),
            ),
            level: fc.constantFrom('trace', 'debug', 'info', 'warn', 'error', 'fatal'),
          }),
          async (testConfig) => {
            const config = {
              level: testConfig.level,
              prettyPrint: false,
              fileEnabled: true,
              filePath: testConfig.filePath,
              fileRotationEnabled: false,
              fileRotationFrequency: 'daily' as const,
              fileRotationPattern: 'YYYY-MM-DD',
              fileMaxFiles: 7,
              fileSizeLimit: '10M',
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
            const transport = (logger as any).createFileTransport();

            // Verify transport uses pino/file instead of pino-roll
            expect(transport.target).toBe('pino/file');
            expect(transport.level).toBe(testConfig.level);
            expect(transport.options.destination).toBe(join(testConfig.filePath, 'app.log'));
            expect(transport.options.mkdir).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
