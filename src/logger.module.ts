import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CustomLogger } from './logger.service';
import { LoggerFactory } from './logger.factory';
import loggerConfig from './logger.config';

@Global()
@Module({
  imports: [ConfigModule.forFeature(loggerConfig)],
  providers: [
    CustomLogger,
    LoggerFactory,
    {
      provide: 'ILogger',
      useExisting: CustomLogger,
    },
  ],
  exports: [CustomLogger, LoggerFactory, 'ILogger'],
})
export class LoggerModule {}
