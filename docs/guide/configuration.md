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
| `LOG_FILE_ROTATION_ENABLED` | Enable automatic log rotation | `true` (when file logging enabled) | `true`, `false` |
| `LOG_FILE_ROTATION_FREQUENCY` | Rotation frequency | `daily` | `daily`, `hourly`, `custom` |
| `LOG_FILE_ROTATION_PATTERN` | Date pattern for filenames | `YYYY-MM-DD` | Any valid date format |
| `LOG_FILE_MAX_FILES` | Number of log files to retain | `7` | Any positive integer |
| `LOG_FILE_SIZE_LIMIT` | Maximum file size before rotation | `10M` | Size string (e.g., `10M`, `100K`) |

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
# Rotation enabled by default with daily rotation
```

### Debug Configuration

```bash
LOG_LEVEL=debug
LOG_PRETTY_PRINT=true
LOG_FILE_ENABLED=true
LOG_FILE_PATH=./logs
# Rotation enabled by default
```

### High-Volume Logging Configuration

For applications with high log volume, use hourly rotation with larger retention:

```bash
NODE_ENV=production
LOG_LEVEL=info
LOG_FILE_ENABLED=true
LOG_FILE_ROTATION_FREQUENCY=hourly
LOG_FILE_ROTATION_PATTERN=YYYY-MM-DD-HH
LOG_FILE_MAX_FILES=168  # 7 days * 24 hours
LOG_FILE_SIZE_LIMIT=50M
```

### Legacy Single-File Configuration

To maintain backward compatibility with single-file logging (no rotation):

```bash
LOG_FILE_ENABLED=true
LOG_FILE_ROTATION_ENABLED=false
LOG_FILE_PATH=./logs
# Creates: ./logs/app.log (single file, grows indefinitely)
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
- Directory is created automatically if it doesn't exist
- **Automatic rotation is enabled by default** - logs rotate daily with 7 days retention

### File Rotation

By default, when file logging is enabled, logs automatically rotate daily to prevent files from growing indefinitely. This behavior can be customized or disabled.

**Default Rotation Behavior:**
- New log file created each day
- Files named with date pattern: `app-2024-01-15.log`
- Keeps last 7 days of logs
- Automatically deletes older files

**Disabling Rotation:**

To use a single log file without rotation (legacy behavior):

```bash
LOG_FILE_ENABLED=true
LOG_FILE_ROTATION_ENABLED=false
# Creates: ./logs/app.log (single file)
```

**Custom Rotation Settings:**

```bash
# Hourly rotation with 24 files retained
LOG_FILE_ROTATION_FREQUENCY=hourly
LOG_FILE_ROTATION_PATTERN=YYYY-MM-DD-HH
LOG_FILE_MAX_FILES=24

# Custom retention period (30 days)
LOG_FILE_MAX_FILES=30

# Larger file size limit
LOG_FILE_SIZE_LIMIT=50M
```

**Rotation with Pretty Printing:**

File rotation works seamlessly with pretty printing. When both are enabled:
- Console output uses pretty formatting (human-readable)
- File output uses JSON format (machine-parseable)
- Both outputs receive the same log messages

```bash
# Development with file rotation
NODE_ENV=development
LOG_PRETTY_PRINT=true
LOG_FILE_ENABLED=true
LOG_FILE_ROTATION_ENABLED=true
# Console: pretty formatted
# Files: ./logs/app-2024-01-15.log (JSON)
```

See [File Rotation](/advanced/file-rotation) for advanced rotation strategies and troubleshooting.

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
  fileRotationEnabled: boolean;
  fileRotationFrequency: 'daily' | 'hourly' | 'custom';
  fileRotationPattern: string;
  fileMaxFiles: number;
  fileSizeLimit: string;
}
```

See the [Configuration API Reference](/api/config) for more details.

