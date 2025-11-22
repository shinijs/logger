# Getting Started

Get up and running with `@shinijs/logger` in your NestJS application.

## Quick Start

The fastest way to get started with `@shinijs/logger`:

### 1. Install the package

```bash
pnpm add @shinijs/logger pino pino-pretty pino-roll
```

### 2. Add to your AppModule

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@shinijs/logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule, // That's it! Logger is now available globally
  ],
})
export class AppModule {}
```

### 3. Use in your services

```typescript
import { Injectable } from '@nestjs/common';
import { CustomLogger } from '@shinijs/logger';

@Injectable()
export class MyService {
  constructor(private readonly logger: CustomLogger) {
    this.logger.setContext('MyService');
  }

  doSomething() {
    this.logger.info('Doing something...');
    this.logger.debug('Debug information', { key: 'value' });
    this.logger.error('Error occurred', error);
  }
}
```

**That's it!** The logger is ready to use. See [Configuration](#configuration) below for customization options.

## Installation

Install the package and its peer dependencies:

```bash
pnpm add @shinijs/logger pino pino-pretty pino-roll
```

### Peer Dependencies

This package requires the following peer dependencies:

| Package | Version | Required |
|---------|---------|----------|
| `@nestjs/common` | `^11.0.0` | Yes |
| `@nestjs/config` | `^4.0.0` | Yes |
| `pino` | `^10.0.0` | Yes |
| `pino-pretty` | `^13.0.0` | Yes |
| `reflect-metadata` | `^0.2.0` | Yes |

If you're already using NestJS, you likely have `@nestjs/common`, `@nestjs/config`, and `reflect-metadata` installed. You only need to ensure `pino` and `pino-pretty` are present.

## Basic Setup

### 1. Import the Module

Add `LoggerModule` to your root `AppModule`:

```typescript
import { Module } from '@nestjs/common';
import { LoggerModule } from '@shinijs/logger';

@Module({
  imports: [LoggerModule],
})
export class AppModule {}
```

The `LoggerModule` is marked as `@Global()`, so you only need to import it once in your root module.

### 2. Use the Logger

#### Option A: Dependency Injection

Inject `CustomLogger` into your services:

```typescript
import { Injectable } from '@nestjs/common';
import { CustomLogger } from '@shinijs/logger';

@Injectable()
export class UserService {
  constructor(private readonly logger: CustomLogger) {
    this.logger.setContext('UserService');
  }

  async createUser(data: CreateUserDto) {
    this.logger.log('Creating user', { email: data.email });
    
    try {
      const user = await this.userRepository.create(data);
      this.logger.log('User created successfully', { userId: user.id });
      return user;
    } catch (error) {
      this.logger.error('Failed to create user', error, { email: data.email });
      throw error;
    }
  }
}
```

#### Option B: Logger Factory

Use `LoggerFactory` to create context-bound loggers:

```typescript
import { Injectable } from '@nestjs/common';
import { LoggerFactory } from '@shinijs/logger';

@Injectable()
export class OrderService {
  private readonly logger = LoggerFactory.createLogger('OrderService');

  async processOrder(orderId: string) {
    this.logger.info('Processing order', { orderId });
    // ... your logic
    this.logger.info('Order processed successfully', { orderId });
  }
}
```

## Configuration

The logger can be configured using environment variables. See the [Configuration Guide](/guide/configuration) for all available options.

### Quick Configuration

```bash
# Log level: trace, debug, info, warn, error, fatal
LOG_LEVEL=info

# Pretty print in development
LOG_PRETTY_PRINT=true

# File logging
LOG_FILE_ENABLED=true
LOG_FILE_PATH=./logs
```

## Next Steps

- Learn about [Configuration Options](/guide/configuration)
- Check out [Usage Examples](/guide/examples)
- Explore the [API Reference](/api/logger-module)

