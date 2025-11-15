# Configuration

Configure `@shinijs/logger` using environment variables or NestJS configuration.

## Environment Variables

All configuration is done through environment variables:

| Variable | Description | Default | Values |
|----------|-------------|---------|--------|
| `LOG_LEVEL` | Minimum log level | `info` | `trace`, `debug`, `info`, `warn`, `error`, `fatal` |
| `LOG_PRETTY_PRINT` | Enable pretty console output | `false` (auto-detected) | `true`, `false` |
| `LOG_FILE_ENABLED` | Enable file logging | `false` | `true`, `false` |
| `LOG_FILE_PATH` | Directory for log files | `./logs` | Any valid path |

### Default Behavior

- **Development** (`NODE_ENV !== 'production'`): Pretty printing is enabled by default
- **Production**: Pretty printing is disabled, JSON output is used
- **File Logging**: Disabled by default, must be explicitly enabled

## Configuration Examples

### Development Configuration

```bash
NODE_ENV=development
LOG_LEVEL=debug
LOG_PRETTY_PRINT=true
LOG_FILE_ENABLED=false
```

### Production Configuration

```bash
NODE_ENV=production
LOG_LEVEL=info
LOG_PRETTY_PRINT=false
LOG_FILE_ENABLED=true
LOG_FILE_PATH=/var/log/app
```

### Debug Configuration

```bash
LOG_LEVEL=debug
LOG_PRETTY_PRINT=true
LOG_FILE_ENABLED=true
LOG_FILE_PATH=./logs
```

## Log Levels

Log levels are ordered from lowest to highest priority:

1. **`trace`** - Very detailed debugging information
2. **`debug`** - Debugging information
3. **`info`** - Informational messages (default)
4. **`warn`** - Warning messages
5. **`error`** - Error messages
6. **`fatal`** - Fatal errors

Only messages at or above the configured level will be logged.

## Pretty Printing

When `LOG_PRETTY_PRINT=true` or in development mode, logs are formatted for human readability:

```
14:23:45 INFO  [UserService] Creating user
14:23:45 INFO  [UserService] User created successfully
```

When disabled (production), logs are output as JSON:

```json
{"level":30,"time":1699999999,"context":"UserService","msg":"Creating user","email":"user@example.com"}
```

## File Logging

When `LOG_FILE_ENABLED=true`:

- Logs are written to files in the directory specified by `LOG_FILE_PATH`
- **File logging works simultaneously with pretty printing** - you can have both console output (with pretty formatting) and file logging enabled at the same time
- Files are named: `app.log` (single file, not rotated by default)
- Directory is created automatically if it doesn't exist

See [File Rotation](/advanced/file-rotation) for more details.

## Using NestJS ConfigModule

The logger integrates with `@nestjs/config`. You can override defaults programmatically:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@shinijs/logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      // Your config
    }),
    LoggerModule,
  ],
})
export class AppModule {}
```

The logger will automatically use values from `ConfigModule` if available, falling back to environment variables.

## TypeScript Configuration

The configuration is fully typed. Import the `LoggerConfig` interface:

```typescript
import type { LoggerConfig } from '@shinijs/logger';

// LoggerConfig interface:
interface LoggerConfig {
  level: string;
  prettyPrint: boolean;
  fileEnabled: boolean;
  filePath: string;
}
```

See the [Configuration API Reference](/api/config) for more details.

