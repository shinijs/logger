# Interfaces

TypeScript interfaces and types used by `@shinijs/logger`.

## ILogger

Main logger interface implemented by `CustomLogger` and `ContextBoundLogger`.

```typescript
interface ILogger {
  log(message: string, context?: string): void;
  error(message: string, error?: Error | unknown, context?: LogContext): void;
  warn(message: string, meta?: Record<string, unknown>, context?: LogContext): void;
  info(message: string, meta?: Record<string, unknown>, context?: LogContext): void;
  debug(message: string, meta?: Record<string, unknown>, context?: LogContext): void;
  setContext(context: string): void;
  getContext(): string;
}
```

### Usage

```typescript
import type { ILogger } from '@shinijs/logger';

function processWithLogger(logger: ILogger) {
  logger.info('Processing...');
}
```

## LogLevel

Type representing log levels.

```typescript
type LogLevel = 'error' | 'warn' | 'info' | 'debug';
```

### Values

- `'error'` - Error messages
- `'warn'` - Warning messages
- `'info'` - Informational messages
- `'debug'` - Debug messages

**Note:** Pino also supports `'trace'` and `'fatal'` levels, which are available through the logger methods.

## LogContext

Type representing log context. Can be a string or a rich context object.

```typescript
type LogContext = string | LogContextObject;
```

### String Context

```typescript
this.logger.info('Message', {}, 'MyService');
```

### Object Context

```typescript
this.logger.info('Message', {}, {
  requestId: 'req-123',
  userId: 'user-456',
  method: 'POST',
  url: '/api/users',
});
```

## LogContextObject

Interface for rich context objects.

```typescript
interface LogContextObject {
  requestId?: string;
  userId?: string;
  userEmail?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  [key: string]: unknown;
}
```

### Properties

- `requestId` - Request identifier
- `userId` - User identifier
- `userEmail` - User email
- `ip` - Client IP address
- `userAgent` - User agent string
- `method` - HTTP method
- `url` - Request URL
- `statusCode` - HTTP status code
- `responseTime` - Response time in milliseconds
- `[key: string]: unknown` - Additional custom properties

### Example

```typescript
this.logger.info('Request processed', {}, {
  requestId: 'req-123',
  userId: 'user-456',
  method: 'POST',
  url: '/api/users',
  statusCode: 201,
  responseTime: 45,
  customField: 'value',
});
```

## LogMetadata

Interface for log metadata.

```typescript
interface LogMetadata {
  context?: string;
  timestamp?: string;
  level?: LogLevel;
  stack?: string;
  [key: string]: unknown;
}
```

### Properties

- `context` - Log context
- `timestamp` - Timestamp string
- `level` - Log level
- `stack` - Error stack trace
- `[key: string]: unknown` - Additional metadata

## Importing Types

```typescript
import type {
  ILogger,
  LogLevel,
  LogContext,
  LogContextObject,
  LogMetadata,
} from '@shinijs/logger';
```

## Type Guards

### Checking Log Level

```typescript
function isValidLogLevel(level: string): level is LogLevel {
  return ['error', 'warn', 'info', 'debug'].includes(level);
}
```

### Checking Context Type

```typescript
function isContextObject(context: LogContext): context is LogContextObject {
  return typeof context === 'object' && context !== null;
}
```

## See Also

- [CustomLogger](/api/custom-logger) - Logger implementation
- [LoggerFactory](/api/logger-factory) - Factory for context-bound loggers
- [Configuration](/api/config) - Configuration types

