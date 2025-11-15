# CustomLogger

The main logger service implementing NestJS `LoggerService` and `ILogger` interface.

## Import

```typescript
import { CustomLogger } from '@shinijs/logger';
```

## Usage

```typescript
import { Injectable } from '@nestjs/common';
import { CustomLogger } from '@shinijs/logger';

@Injectable()
export class MyService {
  constructor(private readonly logger: CustomLogger) {
    this.logger.setContext('MyService');
  }
}
```

## Methods

### `setContext(context: string): void`

Sets the default context for all log messages.

**Parameters:**
- `context` - The context name (e.g., service name)

**Example:**
```typescript
this.logger.setContext('UserService');
this.logger.log('User created'); // Context: 'UserService'
```

### `getContext(): string`

Gets the current context.

**Returns:** The current context string

**Example:**
```typescript
const context = this.logger.getContext(); // 'UserService'
```

### `log(message: string, context?: string): void`

Logs an informational message. Alias for `info()`.

**Parameters:**
- `message` - The log message
- `context` - Optional context override

**Example:**
```typescript
this.logger.log('User created', 'UserService');
// or
this.logger.log('User created'); // Uses default context
```

### `info(message: string, meta?: Record<string, unknown>, context?: LogContext): void`

Logs an informational message with optional metadata.

**Parameters:**
- `message` - The log message
- `meta` - Optional metadata object
- `context` - Optional context (string or object)

**Example:**
```typescript
this.logger.info('User created', {
  userId: '123',
  email: 'user@example.com',
});
```

### `error(message: string, error?: Error | unknown, context?: LogContext): void`

Logs an error message with optional error object.

**Parameters:**
- `message` - The error message
- `error` - Optional Error object or error data
- `context` - Optional context (string or object)

**Example:**
```typescript
try {
  await someOperation();
} catch (error) {
  this.logger.error('Operation failed', error, {
    operation: 'someOperation',
  });
}
```

### `warn(message: string, meta?: Record<string, unknown>, context?: LogContext): void`

Logs a warning message with optional metadata.

**Parameters:**
- `message` - The warning message
- `meta` - Optional metadata object
- `context` - Optional context (string or object)

**Example:**
```typescript
this.logger.warn('Rate limit approaching', {
  current: 90,
  limit: 100,
});
```

### `debug(message: string, meta?: Record<string, unknown>, context?: LogContext): void`

Logs a debug message with optional metadata.

**Parameters:**
- `message` - The debug message
- `meta` - Optional metadata object
- `context` - Optional context (string or object)

**Example:**
```typescript
this.logger.debug('Processing step', {
  step: 1,
  data: someData,
});
```

### `verbose(message: string, meta?: Record<string, unknown>, context?: LogContext): void`

Logs a verbose/trace message with optional metadata.

**Parameters:**
- `message` - The verbose message
- `meta` - Optional metadata object
- `context` - Optional context (string or object)

**Example:**
```typescript
this.logger.verbose('Detailed trace info', {
  internalState: state,
});
```

### `fatal(message: string, meta?: Record<string, unknown>, context?: LogContext): void`

Logs a fatal error message with optional metadata.

**Parameters:**
- `message` - The fatal error message
- `meta` - Optional metadata object
- `context` - Optional context (string or object)

**Example:**
```typescript
this.logger.fatal('Application cannot start', {
  reason: 'Database connection failed',
  error: connectionError,
});
```

## Context Types

The `context` parameter can be:

1. **String** - Simple context name
   ```typescript
   this.logger.info('Message', {}, 'MyService');
   ```

2. **LogContextObject** - Rich context object
   ```typescript
   this.logger.info('Message', {}, {
     requestId: 'req-123',
     userId: 'user-456',
     method: 'POST',
     url: '/api/users',
   });
   ```

## NestJS LoggerService Compatibility

`CustomLogger` implements NestJS `LoggerService`, so it can be used as a drop-in replacement:

```typescript
import { LoggerService } from '@nestjs/common';

// CustomLogger implements LoggerService
const logger: LoggerService = customLogger;

logger.log('Message');
logger.error('Error', 'Trace');
logger.warn('Warning');
logger.debug('Debug');
logger.verbose('Verbose');
```

## See Also

- [ILogger Interface](/api/interfaces) - Logger interface definition
- [LoggerFactory](/api/logger-factory) - Create context-bound loggers
- [Examples](/guide/examples) - Usage examples

