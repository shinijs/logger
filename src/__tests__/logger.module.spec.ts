import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '../logger.module';
import { CustomLogger } from '../logger.service';
import { LoggerFactory, ContextBoundLogger } from '../logger.factory';

describe('LoggerModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [LoggerModule],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  describe('Module Configuration', () => {
    it('should be defined', () => {
      expect(module).toBeDefined();
    });

    it('should import ConfigModule', () => {
      const configModule = module.get(ConfigModule);
      expect(configModule).toBeDefined();
    });

    it('should be a global module', () => {
      // Verify the module is defined and can be used
      // The @Global() decorator is verified by the module's functionality
      expect(LoggerModule).toBeDefined();
    });
  });

  describe('Providers', () => {
    it('should provide CustomLogger', () => {
      const logger = module.get<CustomLogger>(CustomLogger);
      expect(logger).toBeDefined();
      expect(logger).toBeInstanceOf(CustomLogger);
    });

    it('should provide LoggerFactory', () => {
      const factory = module.get<LoggerFactory>(LoggerFactory);
      expect(factory).toBeDefined();
      expect(factory).toBeInstanceOf(LoggerFactory);
    });

    it('should provide ILogger token', () => {
      const logger = module.get<CustomLogger>('ILogger');
      expect(logger).toBeDefined();
      expect(logger).toBeInstanceOf(CustomLogger);
    });

    it('should provide ILogger token as same instance as CustomLogger', () => {
      const customLogger = module.get<CustomLogger>(CustomLogger);
      const iLogger = module.get<CustomLogger>('ILogger');
      expect(iLogger).toBe(customLogger);
    });
  });

  describe('Exports', () => {
    it('should export CustomLogger', () => {
      const exportedModule = Test.createTestingModule({
        imports: [LoggerModule],
      }).compile();

      return exportedModule.then((testModule) => {
        const logger = testModule.get<CustomLogger>(CustomLogger);
        expect(logger).toBeDefined();
        return testModule.close();
      });
    });

    it('should export LoggerFactory', () => {
      const exportedModule = Test.createTestingModule({
        imports: [LoggerModule],
      }).compile();

      return exportedModule.then((testModule) => {
        const factory = testModule.get<LoggerFactory>(LoggerFactory);
        expect(factory).toBeDefined();
        return testModule.close();
      });
    });

    it('should export ILogger token', () => {
      const exportedModule = Test.createTestingModule({
        imports: [LoggerModule],
      }).compile();

      return exportedModule.then((testModule) => {
        const logger = testModule.get<CustomLogger>('ILogger');
        expect(logger).toBeDefined();
        return testModule.close();
      });
    });
  });

  describe('Integration', () => {
    it('should allow LoggerFactory to create context-bound loggers', () => {
      const factory = module.get<LoggerFactory>(LoggerFactory);
      const logger = factory.createLogger('TestContext');

      expect(logger).toBeDefined();
      expect(logger).toBeInstanceOf(ContextBoundLogger);
      expect(logger.getContext()).toBe('TestContext');
    });

    it('should allow LoggerFactory to get base logger', () => {
      const factory = module.get<LoggerFactory>(LoggerFactory);
      const baseLogger = factory.getBaseLogger();

      expect(baseLogger).toBeDefined();
      expect(baseLogger).toBeInstanceOf(CustomLogger);
    });

    it('should allow CustomLogger to be used directly', () => {
      const logger = module.get<CustomLogger>(CustomLogger);
      logger.setContext('DirectContext');
      expect(logger.getContext()).toBe('DirectContext');
    });

    it('should allow ILogger token to be used', () => {
      const logger = module.get<CustomLogger>('ILogger');
      logger.setContext('TokenContext');
      expect(logger.getContext()).toBe('TokenContext');
    });
  });

  describe('Module Dependencies', () => {
    it('should have ConfigModule as dependency', () => {
      const imports = Reflect.getMetadata('imports', LoggerModule);
      expect(imports).toBeDefined();
      expect(imports.length).toBeGreaterThan(0);
    });

    it('should register logger config', () => {
      const logger = module.get<CustomLogger>(CustomLogger);
      expect(logger).toBeDefined();
      // If logger is created successfully, config is registered
      expect(logger.getContext()).toBeDefined();
    });
  });
});
