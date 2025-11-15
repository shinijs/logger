# @shinijs/logger

> Pino-based structured logger for NestJS applications with file rotation and pretty printing

[![CI](https://github.com/shinijs/logger/actions/workflows/ci.yml/badge.svg)](https://github.com/shinijs/logger/actions/workflows/ci.yml)

## Features

- ✅ **Pino-based** - Fast, low-overhead structured logging
- ✅ **NestJS Integration** - Seamless integration with NestJS ecosystem
- ✅ **Pretty Printing** - Beautiful console output in development
- ✅ **File Rotation** - Automatic daily log file rotation
- ✅ **Configurable** - Environment-based configuration
- ✅ **TypeScript** - Full type safety
- ✅ **Context Support** - Scoped logging with context

## Installation

```bash
pnpm add @shinijs/logger pino pino-pretty
```

### Peer Dependencies

This package requires the following peer dependencies to be installed in your project:

| Package | Version | Required |
|---------|---------|----------|
| `@nestjs/common` | `^11.0.0` | Yes |
| `@nestjs/config` | `^4.0.0` | Yes |
| `pino` | `^10.0.0` | Yes |
| `pino-pretty` | `^13.0.0` | Yes |
| `reflect-metadata` | `^0.2.0` | Yes |

**Install all peer dependencies:**

```bash
pnpm add @nestjs/common@^11.0.0 @nestjs/config@^4.0.0 pino@^10.0.0 pino-pretty@^13.0.0 reflect-metadata@^0.2.0
```

**Note:** If you're already using NestJS, you likely have `@nestjs/common`, `@nestjs/config`, and `reflect-metadata` installed. You only need to ensure `pino` and `pino-pretty` are present.

## Quick Start

### 1. Import the Module

```typescript
import { LoggerModule } from '@shinijs/logger';

@Module({
  imports: [LoggerModule],
  // ...
})
export class AppModule {}
```

### 2. Use the Logger

```typescript
import { CustomLogger } from '@shinijs/logger';

@Injectable()
export class YourService {
  constructor(private readonly logger: CustomLogger) {
    this.logger.setContext('YourService');
  }

  doSomething() {
    this.logger.log('Doing something');
    this.logger.error('Something went wrong', { error: 'details' });
  }
}
```

## Configuration

Set environment variables:

```env
# Log level: trace, debug, info, warn, error, fatal
LOG_LEVEL=info

# Pretty print in development
LOG_PRETTY_PRINT=true

# File logging
LOG_FILE_ENABLED=true
LOG_FILE_PATH=./logs
```

## API Reference

### CustomLogger

Main logger service implementing NestJS `LoggerService`.

**Methods:**

```typescript
// Set logging context
setContext(context: string): void

// Log levels
log(message: string, metadata?: object): void
error(message: string, metadata?: object): void
warn(message: string, metadata?: object): void
debug(message: string, metadata?: object): void
verbose(message: string, metadata?: object): void
```

### LoggerFactory

Factory for creating context-bound loggers.

```typescript
import { LoggerFactory } from '@shinijs/logger';

@Injectable()
export class MyService {
  private readonly logger = LoggerFactory.createLogger('MyService');

  doWork() {
    this.logger.log('Working...');
  }
}
```

## Examples

### Basic Logging

```typescript
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
      this.logger.error('Failed to create user', { error, email: data.email });
      throw error;
    }
  }
}
```

### Using Logger Factory

```typescript
import { LoggerFactory } from '@shinijs/logger';

export class SomeClass {
  private readonly logger = LoggerFactory.createLogger('SomeClass');

  process() {
    this.logger.debug('Processing started');
    // ... your logic
    this.logger.debug('Processing completed');
  }
}
```

### Structured Logging

```typescript
this.logger.log('Request processed', {
  method: 'POST',
  path: '/api/users',
  statusCode: 201,
  duration: 45,
  userId: '123',
});
```

## Configuration Options

### Environment Variables

| Variable            | Description                    | Default   |
| ------------------- | ------------------------------ | --------- |
| `LOG_LEVEL`         | Minimum log level              | `info`    |
| `LOG_PRETTY_PRINT`  | Enable pretty console output   | `false`   |
| `LOG_FILE_ENABLED`  | Enable file logging            | `false`   |
| `LOG_FILE_PATH`     | Directory for log files        | `./logs`  |

### Log Levels

From lowest to highest priority:

- `trace` - Very detailed debugging
- `debug` - Debugging information
- `info` - Informational messages (default)
- `warn` - Warning messages
- `error` - Error messages
- `fatal` - Fatal errors

## File Rotation

When file logging is enabled:

- Logs are rotated daily
- Files are named: `app-YYYY-MM-DD.log`
- Old logs are automatically managed
- Directory is created if it doesn't exist

## Development vs Production

**Development** (with `LOG_PRETTY_PRINT=true`):
```
14:23:45 INFO  [UserService] Creating user
14:23:45 INFO  [UserService] User created successfully
```

**Production** (JSON output):
```json
{"level":30,"time":1699999999,"context":"UserService","msg":"Creating user","email":"user@example.com"}
{"level":30,"time":1700000000,"context":"UserService","msg":"User created successfully","userId":"123"}
```

## Testing

```bash
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:cov
```

## License

MIT © Shironex
