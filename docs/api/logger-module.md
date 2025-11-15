# LoggerModule

The main NestJS module for `@shinijs/logger`.

## Import

```typescript
import { LoggerModule } from '@shinijs/logger';
```

## Usage

```typescript
import { Module } from '@nestjs/common';
import { LoggerModule } from '@shinijs/logger';

@Module({
  imports: [LoggerModule],
})
export class AppModule {}
```

## Description

`LoggerModule` is a global NestJS module that provides logging functionality throughout your application. It:

- Registers `CustomLogger` as a global provider
- Registers `LoggerFactory` for creating context-bound loggers
- Integrates with `@nestjs/config` for configuration
- Provides the `ILogger` token for dependency injection

## Global Module

The module is marked as `@Global()`, which means:

- You only need to import it once in your root `AppModule`
- All providers are available throughout your application without re-importing
- No need to add it to feature modules

## Exports

The module exports:

- `CustomLogger` - Main logger service
- `LoggerFactory` - Factory for context-bound loggers
- `ILogger` - Logger interface token

## Configuration

The module automatically integrates with `@nestjs/config`. Configuration is read from:

1. Environment variables (see [Configuration Guide](/guide/configuration))
2. NestJS `ConfigModule` (if configured)

## Example

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@shinijs/logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule,
  ],
})
export class AppModule {}
```

## See Also

- [CustomLogger](/api/custom-logger) - Main logger service
- [LoggerFactory](/api/logger-factory) - Factory for context-bound loggers
- [Configuration Guide](/guide/configuration) - Configuration options

