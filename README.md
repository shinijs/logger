# @shinijs/logger

> Pino-based structured logger for NestJS applications with file rotation and pretty printing

[![CI](https://github.com/shinijs/logger/actions/workflows/ci.yml/badge.svg)](https://github.com/shinijs/logger/actions/workflows/ci.yml)
[![Documentation](https://img.shields.io/badge/docs-vitepress-blue)](https://shinijs.github.io/logger/)

📚 **[Full Documentation](https://shinijs.github.io/logger/)** | [API Reference](https://shinijs.github.io/logger/api/logger-module) | [Examples](https://shinijs.github.io/logger/guide/examples)

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
pnpm add @shinijs/logger pino pino-pretty pino-roll
```

### Peer Dependencies

This package requires the following peer dependencies to be installed in your project:

| Package | Version | Required |
|---------|---------|----------|
| `@nestjs/common` | `^11.0.0` | Yes |
| `@nestjs/config` | `^4.0.0` | Yes |
| `pino` | `^10.0.0` | Yes |
| `pino-pretty` | `^13.0.0` | Yes |
| `pino-roll` | `^4.0.0` | Yes |
| `reflect-metadata` | `^0.2.0` | Yes |

**Install all peer dependencies:**

```bash
pnpm add @nestjs/common@^11.0.0 @nestjs/config@^4.0.0 pino@^10.0.0 pino-pretty@^13.0.0 pino-roll@^4.0.0 reflect-metadata@^0.2.0
```

**Note:** If you're already using NestJS, you likely have `@nestjs/common`, `@nestjs/config`, and `reflect-metadata` installed. You only need to ensure `pino`, `pino-pretty`, and `pino-roll` are present.

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

Factory for creating context-bound loggers. The `ContextBoundLogger` implements NestJS `LoggerService` for full compatibility.

```typescript
import { LoggerFactory } from '@shinijs/logger';

@Injectable()
export class MyService {
  private readonly logger = LoggerFactory.createLogger('MyService');

  doWork() {
    this.logger.log('Working...');
    // ContextBoundLogger implements LoggerService, so it works with NestJS's standard logger interface
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

### Integrating with Rate Limit Module

Use the logger with `@shinijs/rate-limit` for consistent logging:

```typescript
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule, LoggerFactory } from '@shinijs/logger';
import { RateLimitModule } from '@shinijs/rate-limit';

// Token for RateLimit logger provider
export const RATE_LIMIT_LOGGER_TOKEN = Symbol('RATE_LIMIT_LOGGER');

// Create a global module to provide the logger token
@Global()
@Module({
  providers: [
    {
      provide: RATE_LIMIT_LOGGER_TOKEN,
      useFactory: (loggerFactory: LoggerFactory) => {
        return loggerFactory.createLogger('RateLimit');
      },
      inject: [LoggerFactory],
    },
  ],
  exports: [RATE_LIMIT_LOGGER_TOKEN],
})
class RateLimitLoggerModule {}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    RateLimitLoggerModule,
    RateLimitModule.forRoot({
      loggerToken: RATE_LIMIT_LOGGER_TOKEN,
    }),
  ],
})
export class AppModule {}
```

## Configuration Options

### Environment Variables

| Variable                      | Description                              | Default       |
| ----------------------------- | ---------------------------------------- | ------------- |
| `LOG_LEVEL`                   | Minimum log level                        | `info`        |
| `LOG_PRETTY_PRINT`            | Enable pretty console output             | `false`       |
| `LOG_FILE_ENABLED`            | Enable file logging                      | `false`       |
| `LOG_FILE_PATH`               | Directory for log files                  | `./logs`      |
| `LOG_FILE_ROTATION_ENABLED`   | Enable automatic log file rotation       | `true`*       |
| `LOG_FILE_ROTATION_FREQUENCY` | Rotation frequency: `daily`, `hourly`, `custom` | `daily` |
| `LOG_FILE_ROTATION_PATTERN`   | Date pattern for rotated filenames       | `YYYY-MM-DD`  |
| `LOG_FILE_MAX_FILES`          | Number of log files to retain            | `7`           |
| `LOG_FILE_SIZE_LIMIT`         | Maximum file size before rotation        | `10M`         |

\* Rotation is enabled by default when `LOG_FILE_ENABLED=true`. Set to `false` to use a single log file without rotation.

### Log Levels

From lowest to highest priority:

- `trace` - Very detailed debugging
- `debug` - Debugging information
- `info` - Informational messages (default)
- `warn` - Warning messages
- `error` - Error messages
- `fatal` - Fatal errors

## File Logging

When file logging is enabled, logs are written to files in the specified directory with automatic rotation and cleanup.

### Basic Configuration

```env
LOG_FILE_ENABLED=true
LOG_FILE_PATH=./logs
```

**Key Features:**
- **File logging works simultaneously with pretty printing** - you can have both console output and file logging in development
- Directory is created automatically if it doesn't exist
- Automatic log file rotation enabled by default
- Old log files are automatically cleaned up based on retention policy

### Log Rotation

Log rotation is **enabled by default** when file logging is enabled. This prevents log files from growing indefinitely and helps manage disk space.

#### Daily Rotation (Default)

```env
LOG_FILE_ENABLED=true
LOG_FILE_PATH=./logs
LOG_FILE_ROTATION_FREQUENCY=daily
LOG_FILE_MAX_FILES=7
```

**File naming pattern:** `app-YYYY-MM-DD.log`

**Example files:**
```
logs/
├── app-2024-01-15.log  (today)
├── app-2024-01-14.log
├── app-2024-01-13.log
├── app-2024-01-12.log
├── app-2024-01-11.log
├── app-2024-01-10.log
└── app-2024-01-09.log  (oldest, will be deleted when new day starts)
```

**Automatic cleanup:** When the 8th day arrives, the oldest file (`app-2024-01-09.log`) is automatically deleted, keeping only the most recent 7 days of logs.

#### Hourly Rotation

For high-traffic applications or more granular log management:

```env
LOG_FILE_ENABLED=true
LOG_FILE_PATH=./logs
LOG_FILE_ROTATION_FREQUENCY=hourly
LOG_FILE_ROTATION_PATTERN=YYYY-MM-DD-HH
LOG_FILE_MAX_FILES=24
```

**File naming pattern:** `app-YYYY-MM-DD-HH.log`

**Example files:**
```
logs/
├── app-2024-01-15-14.log  (current hour)
├── app-2024-01-15-13.log
├── app-2024-01-15-12.log
└── ... (keeps last 24 hours)
```

#### Size-Based Rotation

Rotate logs when they reach a specific size:

```env
LOG_FILE_ENABLED=true
LOG_FILE_PATH=./logs
LOG_FILE_SIZE_LIMIT=50M  # Rotate when file reaches 50MB
```

**Supported size units:** `K` (kilobytes), `M` (megabytes), `G` (gigabytes)

#### Disabled Rotation

To use a single log file without rotation (legacy behavior):

```env
LOG_FILE_ENABLED=true
LOG_FILE_PATH=./logs
LOG_FILE_ROTATION_ENABLED=false
```

**File naming:** `app.log` (single file, grows indefinitely)

**Use case:** Suitable when you have external log management tools or limited logging needs.

### Rotation Configuration Reference

| Setting | Options | Description |
|---------|---------|-------------|
| **Frequency** | `daily`, `hourly`, `custom` | How often to create new log files |
| **Pattern** | Date format string | Filename pattern (e.g., `YYYY-MM-DD`, `YYYY-MM-DD-HH`) |
| **Max Files** | Number (e.g., `7`, `24`, `30`) | Number of log files to keep before deleting oldest |
| **Size Limit** | Size string (e.g., `10M`, `50M`, `1G`) | Maximum file size before rotation |

### Complete Example

Production configuration with daily rotation and 30-day retention:

```env
# Basic logging
LOG_LEVEL=info
LOG_PRETTY_PRINT=false

# File logging with rotation
LOG_FILE_ENABLED=true
LOG_FILE_PATH=/var/log/myapp

# Rotation settings
LOG_FILE_ROTATION_ENABLED=true
LOG_FILE_ROTATION_FREQUENCY=daily
LOG_FILE_ROTATION_PATTERN=YYYY-MM-DD
LOG_FILE_MAX_FILES=30
LOG_FILE_SIZE_LIMIT=100M
```

This configuration will:
- Create daily log files: `app-2024-01-15.log`, `app-2024-01-14.log`, etc.
- Keep the last 30 days of logs
- Rotate early if a file exceeds 100MB
- Automatically delete logs older than 30 days

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

## Documentation

📚 **[Full Documentation](https://shinijs.github.io/logger/)** is available with:

- Complete API reference
- Configuration guide
- Usage examples
- Best practices
- Advanced patterns

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting pull requests.

### Quick Start for Contributors

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`pnpm test && pnpm lint:check`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

For detailed guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT © Shironex
