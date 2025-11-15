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
}
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `level` | `string` | Minimum log level (`trace`, `debug`, `info`, `warn`, `error`, `fatal`) |
| `prettyPrint` | `boolean` | Enable pretty console output |
| `fileEnabled` | `boolean` | Enable file logging |
| `filePath` | `string` | Directory path for log files |

## Default Values

```typescript
{
  level: process.env.LOG_LEVEL || 'info',
  prettyPrint: process.env.NODE_ENV !== 'production',
  fileEnabled: process.env.LOG_FILE_ENABLED === 'true',
  filePath: process.env.LOG_FILE_PATH || './logs',
}
```

## Environment Variables

Configuration is read from environment variables:

| Variable | Config Property | Default |
|----------|----------------|---------|
| `LOG_LEVEL` | `level` | `'info'` |
| `LOG_PRETTY_PRINT` | `prettyPrint` | `NODE_ENV !== 'production'` |
| `LOG_FILE_ENABLED` | `fileEnabled` | `false` |
| `LOG_FILE_PATH` | `filePath` | `'./logs'` |

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

The configuration values are not validated at runtime. Ensure:

- `level` is a valid log level
- `filePath` is a valid directory path
- `prettyPrint` and `fileEnabled` are boolean values

## See Also

- [Configuration Guide](/guide/configuration) - How to configure the logger
- [LoggerModule](/api/logger-module) - Module configuration
- [File Rotation](/advanced/file-rotation) - File logging details

