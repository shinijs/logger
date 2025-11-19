# Configuration

Configuration interface and options for `@shinijs/logger`.

## LoggerConfig

Main configuration interface.

```typescript
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

### Properties

#### Core Properties

| Property | Type | Description |
|----------|------|-------------|
| `level` | `string` | Minimum log level (`trace`, `debug`, `info`, `warn`, `error`, `fatal`) |
| `prettyPrint` | `boolean` | Enable pretty console output |
| `fileEnabled` | `boolean` | Enable file logging |
| `filePath` | `string` | Directory path for log files |

#### File Rotation Properties

| Property | Type | Description |
|----------|------|-------------|
| `fileRotationEnabled` | `boolean` | Enable automatic log file rotation. When enabled, logs are written to timestamped files instead of a single `app.log` file |
| `fileRotationFrequency` | `'daily' \| 'hourly' \| 'custom'` | Rotation frequency. `daily` creates new files each day, `hourly` creates new files each hour, `custom` allows custom intervals |
| `fileRotationPattern` | `string` | Date format pattern for log file names. Uses moment.js format tokens (e.g., `YYYY-MM-DD` for daily, `YYYY-MM-DD-HH` for hourly) |
| `fileMaxFiles` | `number` | Maximum number of log files to retain. Older files are automatically deleted when this limit is exceeded |
| `fileSizeLimit` | `string` | Maximum file size before rotation (e.g., `10M` for 10 megabytes, `1G` for 1 gigabyte). Works in conjunction with time-based rotation |

## Default Values

```typescript
{
  level: process.env.LOG_LEVEL || 'info',
  prettyPrint: process.env.NODE_ENV !== 'production',
  fileEnabled: process.env.LOG_FILE_ENABLED === 'true',
  filePath: process.env.LOG_FILE_PATH || './logs',
  fileRotationEnabled: fileEnabled && process.env.LOG_FILE_ROTATION_ENABLED !== 'false',
  fileRotationFrequency: process.env.LOG_FILE_ROTATION_FREQUENCY || 'daily',
  fileRotationPattern: process.env.LOG_FILE_ROTATION_PATTERN || 'YYYY-MM-DD',
  fileMaxFiles: parseInt(process.env.LOG_FILE_MAX_FILES || '7', 10),
  fileSizeLimit: process.env.LOG_FILE_SIZE_LIMIT || '10M',
}
```

::: tip Default Rotation Behavior
When file logging is enabled (`fileEnabled: true`), rotation is automatically enabled by default. To disable rotation and use a single `app.log` file, explicitly set `LOG_FILE_ROTATION_ENABLED=false`.
:::

## Environment Variables

Configuration is read from environment variables:

### Core Variables

| Variable | Config Property | Default | Valid Values |
|----------|----------------|---------|--------------|
| `LOG_LEVEL` | `level` | `'info'` | `trace`, `debug`, `info`, `warn`, `error`, `fatal` |
| `LOG_PRETTY_PRINT` | `prettyPrint` | `NODE_ENV !== 'production'` | `true`, `false` |
| `LOG_FILE_ENABLED` | `fileEnabled` | `false` | `true`, `false` |
| `LOG_FILE_PATH` | `filePath` | `'./logs'` | Any valid directory path |

### File Rotation Variables

| Variable | Config Property | Default | Valid Values |
|----------|----------------|---------|--------------|
| `LOG_FILE_ROTATION_ENABLED` | `fileRotationEnabled` | `true` (when file logging enabled) | `true`, `false` |
| `LOG_FILE_ROTATION_FREQUENCY` | `fileRotationFrequency` | `'daily'` | `daily`, `hourly`, `custom` |
| `LOG_FILE_ROTATION_PATTERN` | `fileRotationPattern` | `'YYYY-MM-DD'` | Any moment.js date format |
| `LOG_FILE_MAX_FILES` | `fileMaxFiles` | `7` | Any positive integer |
| `LOG_FILE_SIZE_LIMIT` | `fileSizeLimit` | `'10M'` | Size string (e.g., `10M`, `1G`, `500K`) |

## Accessing Configuration

### Via Dependency Injection

```typescript
import { Injectable, Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import loggerConfig, { LoggerConfig } from '@shinijs/logger';

@Injectable()
export class MyService {
  constructor(
    @Inject(loggerConfig.KEY)
    private readonly config: ConfigType<typeof loggerConfig>,
  ) {
    console.log('Log level:', this.config.level);
    console.log('Pretty print:', this.config.prettyPrint);
  }
}
```

### Type-Safe Access

```typescript
import type { LoggerConfig } from '@shinijs/logger';

function validateConfig(config: LoggerConfig): boolean {
  const validLevels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
  return validLevels.includes(config.level);
}
```

## Configuration Registration

The configuration is registered using `@nestjs/config`:

```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('logger', (): LoggerConfig => ({
  level: process.env.LOG_LEVEL || 'info',
  prettyPrint: process.env.NODE_ENV !== 'production',
  fileEnabled: process.env.LOG_FILE_ENABLED === 'true',
  filePath: process.env.LOG_FILE_PATH || './logs',
}));
```

## Custom Configuration

You can override the default configuration by providing your own:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@shinijs/logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        () => ({
          logger: {
            level: 'debug',
            prettyPrint: true,
            fileEnabled: true,
            filePath: './custom-logs',
            fileRotationEnabled: true,
            fileRotationFrequency: 'daily',
            fileRotationPattern: 'YYYY-MM-DD',
            fileMaxFiles: 14,
            fileSizeLimit: '20M',
          },
        }),
      ],
    }),
    LoggerModule,
  ],
})
export class AppModule {}
```

## Validation

The configuration includes automatic validation with fallback to defaults:

### Core Properties
- `level` must be a valid log level (`trace`, `debug`, `info`, `warn`, `error`, `fatal`)
- `filePath` must be a valid directory path
- `prettyPrint` and `fileEnabled` are boolean values

### Rotation Properties
- `fileRotationFrequency` must be `daily`, `hourly`, or `custom` (invalid values default to `daily` with console warning)
- `fileMaxFiles` must be a valid positive integer (invalid values default to `7` with console warning)
- `fileSizeLimit` should use format like `10M`, `1G`, `500K`
- `fileRotationPattern` should use valid moment.js date format tokens

### Behavior Notes
- **File logging works simultaneously with pretty printing** - when both are enabled, logs are written to both the console (with pretty formatting) and to the log file
- **Rotation is enabled by default** when file logging is enabled - explicitly set `LOG_FILE_ROTATION_ENABLED=false` to use a single log file
- **Invalid configuration values** trigger console warnings and fall back to safe defaults

## Rotation Configuration Examples

### Daily Rotation (Default)

```bash
LOG_FILE_ENABLED=true
LOG_FILE_PATH=./logs
# Rotation is enabled by default
# Creates: app-2024-01-15.log, app-2024-01-16.log, etc.
```

### Hourly Rotation

```bash
LOG_FILE_ENABLED=true
LOG_FILE_ROTATION_FREQUENCY=hourly
LOG_FILE_ROTATION_PATTERN=YYYY-MM-DD-HH
# Creates: app-2024-01-15-14.log, app-2024-01-15-15.log, etc.
```

### Custom Retention Period

```bash
LOG_FILE_ENABLED=true
LOG_FILE_MAX_FILES=30
# Keeps 30 days of logs instead of default 7
```

### Size-Based Rotation

```bash
LOG_FILE_ENABLED=true
LOG_FILE_SIZE_LIMIT=50M
# Rotates when file reaches 50MB
```

### Disable Rotation

```bash
LOG_FILE_ENABLED=true
LOG_FILE_ROTATION_ENABLED=false
# Uses single app.log file (legacy behavior)
```

## File Naming Patterns

When rotation is enabled, log files are named using the base name `app` plus the date pattern:

| Frequency | Pattern | Example Filename |
|-----------|---------|------------------|
| `daily` | `YYYY-MM-DD` | `app-2024-01-15.log` |
| `hourly` | `YYYY-MM-DD-HH` | `app-2024-01-15-14.log` |
| `custom` | User-defined | `app-<pattern>.log` |
| Disabled | N/A | `app.log` |

## See Also

- [Configuration Guide](/guide/configuration) - How to configure the logger
- [LoggerModule](/api/logger-module) - Module configuration
- [File Rotation](/advanced/file-rotation) - Advanced rotation strategies and troubleshooting

