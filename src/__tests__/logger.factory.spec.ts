import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LoggerFactory, ContextBoundLogger } from '../logger.factory';
import { CustomLogger } from '../logger.service';
import loggerConfig from '../logger.config';

describe('LoggerFactory', () => {
  let factory: LoggerFactory;
  let baseLogger: CustomLogger;
  let mockBaseLogger: jest.Mocked<CustomLogger>;

  const createMockConfig = () => ({
    level: 'info',
    prettyPrint: false,
    fileEnabled: false,
    filePath: './logs',
  });

  beforeEach(async () => {
    // Create mock base logger
    mockBaseLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      setContext: jest.fn(),
      getContext: jest.fn().mockReturnValue('Application'),
    } as unknown as jest.Mocked<CustomLogger>;

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(loggerConfig)],
      providers: [
        {
          provide: loggerConfig.KEY,
          useValue: createMockConfig(),
        },
        {
          provide: CustomLogger,
          useValue: mockBaseLogger,
        },
        LoggerFactory,
      ],
    }).compile();

    factory = module.get<LoggerFactory>(LoggerFactory);
    baseLogger = module.get<CustomLogger>(CustomLogger);
  });

  describe('createLogger', () => {
    it('should create a ContextBoundLogger with the specified context', () => {
      const context = 'TestContext';
      const logger = factory.createLogger(context);

      expect(logger).toBeInstanceOf(ContextBoundLogger);
      expect(logger.getContext()).toBe(context);
    });

    it('should create different loggers with different contexts', () => {
      const logger1 = factory.createLogger('Context1');
      const logger2 = factory.createLogger('Context2');

      expect(logger1.getContext()).toBe('Context1');
      expect(logger2.getContext()).toBe('Context2');
    });
  });

  describe('getBaseLogger', () => {
    it('should return the base logger instance', () => {
      const base = factory.getBaseLogger();
      expect(base).toBe(baseLogger);
    });
  });
});

describe('ContextBoundLogger', () => {
  let contextLogger: ContextBoundLogger;
  let mockBaseLogger: jest.Mocked<CustomLogger>;

  beforeEach(() => {
    mockBaseLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      setContext: jest.fn(),
      getContext: jest.fn().mockReturnValue('Application'),
    } as unknown as jest.Mocked<CustomLogger>;

    contextLogger = new ContextBoundLogger(mockBaseLogger, 'BoundContext');
  });

  describe('Context Management', () => {
    it('should return the bound context', () => {
      expect(contextLogger.getContext()).toBe('BoundContext');
    });

    it('should not change context when setContext is called', () => {
      contextLogger.setContext('NewContext');
      expect(contextLogger.getContext()).toBe('BoundContext');
      expect(mockBaseLogger.setContext).not.toHaveBeenCalled();
    });
  });

  describe('Log Method Delegation', () => {
    it('should delegate log to base logger with bound context', () => {
      contextLogger.log('test message');
      expect(mockBaseLogger.log).toHaveBeenCalledWith('test message', 'BoundContext');
    });

    it('should delegate log to base logger with provided context', () => {
      contextLogger.log('test message', 'ProvidedContext');
      expect(mockBaseLogger.log).toHaveBeenCalledWith('test message', 'ProvidedContext');
    });
  });

  describe('Error Method Delegation', () => {
    it('should delegate error to base logger with bound context', () => {
      const error = new Error('Test error');
      contextLogger.error('test message', error);
      expect(mockBaseLogger.error).toHaveBeenCalledWith('test message', error, 'BoundContext');
    });

    it('should delegate error to base logger with provided context', () => {
      const error = new Error('Test error');
      contextLogger.error('test message', error, 'ProvidedContext');
      expect(mockBaseLogger.error).toHaveBeenCalledWith('test message', error, 'ProvidedContext');
    });

    it('should delegate error to base logger without error', () => {
      contextLogger.error('test message');
      expect(mockBaseLogger.error).toHaveBeenCalledWith('test message', undefined, 'BoundContext');
    });
  });

  describe('Warn Method Delegation', () => {
    it('should delegate warn to base logger with bound context', () => {
      const meta = { key: 'value' };
      contextLogger.warn('test message', meta);
      expect(mockBaseLogger.warn).toHaveBeenCalledWith('test message', meta, 'BoundContext');
    });

    it('should delegate warn to base logger with provided context', () => {
      const meta = { key: 'value' };
      contextLogger.warn('test message', meta, 'ProvidedContext');
      expect(mockBaseLogger.warn).toHaveBeenCalledWith('test message', meta, 'ProvidedContext');
    });

    it('should delegate warn to base logger without meta', () => {
      contextLogger.warn('test message');
      expect(mockBaseLogger.warn).toHaveBeenCalledWith('test message', undefined, 'BoundContext');
    });
  });

  describe('Info Method Delegation', () => {
    it('should delegate info to base logger with bound context', () => {
      const meta = { key: 'value' };
      contextLogger.info('test message', meta);
      expect(mockBaseLogger.info).toHaveBeenCalledWith('test message', meta, 'BoundContext');
    });

    it('should delegate info to base logger with provided context', () => {
      const meta = { key: 'value' };
      contextLogger.info('test message', meta, 'ProvidedContext');
      expect(mockBaseLogger.info).toHaveBeenCalledWith('test message', meta, 'ProvidedContext');
    });

    it('should delegate info to base logger without meta', () => {
      contextLogger.info('test message');
      expect(mockBaseLogger.info).toHaveBeenCalledWith('test message', undefined, 'BoundContext');
    });
  });

  describe('Debug Method Delegation', () => {
    it('should delegate debug to base logger with bound context', () => {
      const meta = { key: 'value' };
      contextLogger.debug('test message', meta);
      expect(mockBaseLogger.debug).toHaveBeenCalledWith('test message', meta, 'BoundContext');
    });

    it('should delegate debug to base logger with provided context', () => {
      const meta = { key: 'value' };
      contextLogger.debug('test message', meta, 'ProvidedContext');
      expect(mockBaseLogger.debug).toHaveBeenCalledWith('test message', meta, 'ProvidedContext');
    });

    it('should delegate debug to base logger without meta', () => {
      contextLogger.debug('test message');
      expect(mockBaseLogger.debug).toHaveBeenCalledWith('test message', undefined, 'BoundContext');
    });
  });
});
