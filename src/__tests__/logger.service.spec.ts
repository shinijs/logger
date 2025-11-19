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

describe('CustomLogger', () => {
  let mockPinoLogger: jest.Mocked<pino.Logger>;
  let mockPinoPretty: jest.Mock;
  let mockExistsSync: jest.Mock;
  let mockMkdirSync: jest.Mock;

  const createMockConfig = (overrides?: Partial<ReturnType<typeof loggerConfig>>) => ({
    level: 'info',
    prettyPrint: false,
    fileEnabled: false,
    filePath: './logs',
    fileRotationEnabled: true,
    fileRotationFrequency: 'daily' as const,
    fileRotationPattern: 'YYYY-MM-DD',
    fileMaxFiles: 7,
    fileSizeLimit: '10M',
    ...overrides,
  });

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock pino logger
    mockPinoLogger = {
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      trace: jest.fn(),
      fatal: jest.fn(),
    } as unknown as jest.Mocked<pino.Logger>;

    // Mock pino-pretty
    mockPinoPretty = pinoPretty as unknown as jest.Mock;
    mockPinoPretty.mockReturnValue({});

    // Mock pino
    (pino as unknown as jest.Mock).mockReturnValue(mockPinoLogger);

    // Mock fs functions
    mockExistsSync = existsSync as jest.Mock;
    mockMkdirSync = mkdirSync as jest.Mock;
    mockExistsSync.mockReturnValue(true);
    mockMkdirSync.mockImplementation(() => {});
  });

  describe('Initialization', () => {
    it('should initialize with default config', async () => {
      const config = createMockConfig();
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
      expect(logger).toBeDefined();
      expect(pino).toHaveBeenCalled();
    });

    it('should initialize with custom config', async () => {
      const config = createMockConfig({
        level: 'debug',
        prettyPrint: true,
      });
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
      expect(logger).toBeDefined();
    });
  });

  describe('createPinoLogger', () => {
    it('should create pino logger with pretty print when prettyPrint is true', async () => {
      const config = createMockConfig({ prettyPrint: true });
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

      expect(mockPinoPretty).toHaveBeenCalledWith({
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
        singleLine: false,
        levelFirst: true,
        messageFormat: '{context} {msg}',
      });
      expect(pino).toHaveBeenCalledWith({ level: 'info' }, {});
    });

    it('should create pino logger without pretty print when prettyPrint is false', async () => {
      const config = createMockConfig({ prettyPrint: false });
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

      expect(pino).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
          transport: expect.objectContaining({
            targets: expect.arrayContaining([
              expect.objectContaining({
                target: 'pino/file',
                level: 'info',
                options: { destination: 1 },
              }),
            ]),
          }),
        }),
      );
    });

    it('should create file transport when fileEnabled is true and directory exists', async () => {
      const config = createMockConfig({
        fileEnabled: true,
        filePath: './test-logs',
        prettyPrint: false,
        fileRotationEnabled: true,
      });
      mockExistsSync.mockReturnValue(true);

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

      expect(mockExistsSync).toHaveBeenCalledWith('./test-logs');
      expect(mockMkdirSync).not.toHaveBeenCalled();
      expect(pino).toHaveBeenCalledWith(
        expect.objectContaining({
          transport: expect.objectContaining({
            targets: expect.arrayContaining([
              expect.objectContaining({
                target: 'pino-roll',
                options: expect.objectContaining({
                  file: join('./test-logs', 'app'),
                  frequency: 'daily',
                }),
              }),
            ]),
          }),
        }),
      );
    });

    it('should create directory when fileEnabled is true and directory does not exist', async () => {
      const config = createMockConfig({
        fileEnabled: true,
        filePath: './test-logs',
        prettyPrint: false,
      });
      mockExistsSync.mockReturnValue(false);

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

      expect(mockExistsSync).toHaveBeenCalledWith('./test-logs');
      expect(mockMkdirSync).toHaveBeenCalledWith('./test-logs', { recursive: true });
    });

    it('should not create file transport when fileEnabled is false', async () => {
      const config = createMockConfig({
        fileEnabled: false,
        prettyPrint: false,
      });

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

      expect(mockExistsSync).not.toHaveBeenCalled();
      expect(mockMkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('Context Management', () => {
    let logger: CustomLogger;

    beforeEach(async () => {
      const config = createMockConfig();
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

      logger = module.get<CustomLogger>(CustomLogger);
    });

    it('should have default context "Application"', () => {
      expect(logger.getContext()).toBe('Application');
    });

    it('should set and get context', () => {
      logger.setContext('TestContext');
      expect(logger.getContext()).toBe('TestContext');
    });

    it('should update context multiple times', () => {
      logger.setContext('Context1');
      expect(logger.getContext()).toBe('Context1');

      logger.setContext('Context2');
      expect(logger.getContext()).toBe('Context2');
    });
  });

  describe('formatMessage', () => {
    let logger: CustomLogger;

    beforeEach(async () => {
      const config = createMockConfig();
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

      logger = module.get<CustomLogger>(CustomLogger);
      logger.setContext('TestContext');
    });

    it('should format message with string context', () => {
      logger.info('test message', undefined, 'CustomContext');
      expect(mockPinoLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'test message',
          context: 'CustomContext',
        }),
        'test message',
      );
    });

    it('should format message with object context', () => {
      const contextObj = { requestId: '123', userId: '456' };
      logger.info('test message', undefined, contextObj);
      expect(mockPinoLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'test message',
          requestId: '123',
          userId: '456',
          context: 'TestContext',
        }),
        'test message',
      );
    });

    it('should format message with object context that has context property', () => {
      const contextObj = { context: 'ObjectContext', requestId: '123' };
      logger.info('test message', undefined, contextObj);
      expect(mockPinoLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'test message',
          context: 'ObjectContext',
          requestId: '123',
        }),
        'test message',
      );
    });

    it('should format message with default context when no context provided', () => {
      logger.info('test message');
      expect(mockPinoLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'test message',
          context: 'TestContext',
        }),
        'test message',
      );
    });
  });

  describe('Logging Methods', () => {
    let logger: CustomLogger;

    beforeEach(async () => {
      const config = createMockConfig();
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

      logger = module.get<CustomLogger>(CustomLogger);
    });

    it('should call pino.info for log method', () => {
      logger.log('test message', 'TestContext');
      expect(mockPinoLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'test message',
          context: 'TestContext',
        }),
        'test message',
      );
    });

    it('should call pino.info for info method', () => {
      const meta = { key: 'value' };
      logger.info('test message', meta, 'TestContext');
      expect(mockPinoLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'test message',
          context: 'TestContext',
          key: 'value',
        }),
        'test message',
      );
    });

    it('should call pino.warn for warn method', () => {
      const meta = { key: 'value' };
      logger.warn('test message', meta, 'TestContext');
      expect(mockPinoLogger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'test message',
          context: 'TestContext',
          key: 'value',
        }),
        'test message',
      );
    });

    it('should call pino.debug for debug method', () => {
      const meta = { key: 'value' };
      logger.debug('test message', meta, 'TestContext');
      expect(mockPinoLogger.debug).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'test message',
          context: 'TestContext',
          key: 'value',
        }),
        'test message',
      );
    });

    it('should call pino.trace for verbose method', () => {
      const meta = { key: 'value' };
      logger.verbose('test message', meta, 'TestContext');
      expect(mockPinoLogger.trace).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'test message',
          context: 'TestContext',
          key: 'value',
        }),
        'test message',
      );
    });

    it('should call pino.fatal for fatal method', () => {
      const meta = { key: 'value' };
      logger.fatal('test message', meta, 'TestContext');
      expect(mockPinoLogger.fatal).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'test message',
          context: 'TestContext',
          key: 'value',
        }),
        'test message',
      );
    });
  });

  describe('Error Method', () => {
    let logger: CustomLogger;

    beforeEach(async () => {
      const config = createMockConfig();
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

      logger = module.get<CustomLogger>(CustomLogger);
    });

    it('should call pino.error with Error object', () => {
      const error = new Error('Test error');
      logger.error('test message', error, 'TestContext');
      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'test message',
          context: 'TestContext',
          err: error,
        }),
        'test message',
      );
    });

    it('should call pino.error with trace object', () => {
      const trace = { stack: 'stack trace' };
      logger.error('test message', trace, 'TestContext');
      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'test message',
          context: 'TestContext',
          trace,
        }),
        'test message',
      );
    });

    it('should call pino.error without trace', () => {
      logger.error('test message', undefined, 'TestContext');
      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'test message',
          context: 'TestContext',
        }),
        'test message',
      );
    });

    it('should call pino.error with string trace', () => {
      logger.error('test message', 'trace string', 'TestContext');
      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'test message',
          context: 'TestContext',
          trace: 'trace string',
        }),
        'test message',
      );
    });
  });

  describe('getRotationOptions', () => {
    it('should return rotation options matching configuration values', async () => {
      const config = createMockConfig({
        filePath: './test-logs',
        fileRotationFrequency: 'daily',
        fileRotationPattern: 'YYYY-MM-DD',
        fileMaxFiles: 7,
        fileSizeLimit: '10M',
      });

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

      expect(options).toEqual({
        file: join('./test-logs', 'app'),
        frequency: 'daily',
        dateFormat: 'YYYY-MM-DD',
        maxFiles: 7,
        size: '10M',
      });
    });

    it('should construct file path correctly', async () => {
      const config = createMockConfig({
        filePath: '/var/log/myapp',
      });

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

      expect(options.file).toBe(join('/var/log/myapp', 'app'));
    });

    it('should map frequency correctly', async () => {
      const config = createMockConfig({
        fileRotationFrequency: 'hourly',
      });

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

      expect(options.frequency).toBe('hourly');
    });

    it('should map pattern correctly', async () => {
      const config = createMockConfig({
        fileRotationPattern: 'YYYY-MM-DD-HH',
      });

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

      expect(options.dateFormat).toBe('YYYY-MM-DD-HH');
    });
  });

  describe('createPinoLogger with rotation', () => {
    it('should create logger with rotation enabled', async () => {
      const config = createMockConfig({
        fileEnabled: true,
        fileRotationEnabled: true,
        prettyPrint: false,
        filePath: './test-logs',
      });

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

      expect(pino).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
          transport: expect.objectContaining({
            targets: expect.arrayContaining([
              expect.objectContaining({
                target: 'pino/file',
                options: { destination: 1 },
              }),
              expect.objectContaining({
                target: 'pino-roll',
                level: 'info',
                options: expect.objectContaining({
                  file: join('./test-logs', 'app'),
                  frequency: 'daily',
                }),
              }),
            ]),
          }),
        }),
      );
    });

    it('should create logger with rotation disabled', async () => {
      const config = createMockConfig({
        fileEnabled: true,
        fileRotationEnabled: false,
        prettyPrint: false,
        filePath: './test-logs',
      });

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

      expect(pino).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
          transport: expect.objectContaining({
            targets: expect.arrayContaining([
              expect.objectContaining({
                target: 'pino/file',
                options: { destination: 1 },
              }),
              expect.objectContaining({
                target: 'pino/file',
                level: 'info',
                options: expect.objectContaining({
                  destination: join('./test-logs', 'app.log'),
                  mkdir: true,
                }),
              }),
            ]),
          }),
        }),
      );
    });

    it('should create multi-stream with pretty print and rotation', async () => {
      const config = createMockConfig({
        fileEnabled: true,
        fileRotationEnabled: true,
        prettyPrint: true,
        filePath: './test-logs',
      });

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

      expect(pino).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
          transport: expect.objectContaining({
            targets: expect.arrayContaining([
              expect.objectContaining({
                target: 'pino-pretty',
                level: 'info',
              }),
              expect.objectContaining({
                target: 'pino-roll',
                level: 'info',
                options: expect.objectContaining({
                  file: join('./test-logs', 'app'),
                  frequency: 'daily',
                }),
              }),
            ]),
          }),
        }),
      );
    });

    it('should create production mode with rotation', async () => {
      const config = createMockConfig({
        fileEnabled: true,
        fileRotationEnabled: true,
        prettyPrint: false,
        filePath: './prod-logs',
        level: 'warn',
      });

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

      expect(pino).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'warn',
          transport: expect.objectContaining({
            targets: expect.arrayContaining([
              expect.objectContaining({
                target: 'pino/file',
                level: 'warn',
                options: { destination: 1 },
              }),
              expect.objectContaining({
                target: 'pino-roll',
                level: 'warn',
                options: expect.objectContaining({
                  file: join('./prod-logs', 'app'),
                  frequency: 'daily',
                }),
              }),
            ]),
          }),
        }),
      );
    });
  });

  describe('createFileTransport', () => {
    it('should return pino-roll transport when rotation enabled', async () => {
      const config = createMockConfig({
        fileEnabled: true,
        fileRotationEnabled: true,
        filePath: './test-logs',
        level: 'info',
      });

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

      expect(transport.target).toBe('pino-roll');
      expect(transport.level).toBe('info');
      expect(transport.options).toEqual({
        file: join('./test-logs', 'app'),
        frequency: 'daily',
        dateFormat: 'YYYY-MM-DD',
        maxFiles: 7,
        size: '10M',
      });
    });

    it('should return pino/file transport when rotation disabled', async () => {
      const config = createMockConfig({
        fileEnabled: true,
        fileRotationEnabled: false,
        filePath: './test-logs',
        level: 'debug',
      });

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

      expect(transport.target).toBe('pino/file');
      expect(transport.level).toBe('debug');
      expect(transport.options).toEqual({
        destination: join('./test-logs', 'app.log'),
        mkdir: true,
      });
    });

    it('should include correct level in transport', async () => {
      const config = createMockConfig({
        fileEnabled: true,
        fileRotationEnabled: true,
        level: 'warn',
      });

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

      expect(transport.level).toBe('warn');
    });

    it('should include rotation options when enabled', async () => {
      const config = createMockConfig({
        fileEnabled: true,
        fileRotationEnabled: true,
        filePath: './custom-logs',
        fileRotationFrequency: 'hourly',
        fileRotationPattern: 'YYYY-MM-DD-HH',
        fileMaxFiles: 14,
        fileSizeLimit: '20M',
      });

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

      expect(transport.options).toEqual({
        file: join('./custom-logs', 'app'),
        frequency: 'hourly',
        dateFormat: 'YYYY-MM-DD-HH',
        maxFiles: 14,
        size: '20M',
      });
    });

    it('should include single file destination when disabled', async () => {
      const config = createMockConfig({
        fileEnabled: true,
        fileRotationEnabled: false,
        filePath: './single-file-logs',
      });

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

      expect(transport.options.destination).toBe(join('./single-file-logs', 'app.log'));
      expect(transport.options.mkdir).toBe(true);
    });
  });
});
