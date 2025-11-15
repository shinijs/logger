# LoggerFactory

Factory for creating context-bound logger instances.

## Import

```typescript
import { LoggerFactory } from '@shinijs/logger';
```

## Usage

```typescript
import { Injectable } from '@nestjs/common';
import { LoggerFactory } from '@shinijs/logger';

@Injectable()
export class MyService {
  private readonly logger = LoggerFactory.createLogger('MyService');

  doWork() {
    this.logger.info('Working...'); // Context is automatically 'MyService'
  }
}
```

## Methods

### `createLogger(context: string): ContextBoundLogger`

Creates a context-bound logger instance that automatically applies the specified context to all log messages.

**Parameters:**
- `context` - The context name (e.g., service name)

**Returns:** A `ContextBoundLogger` instance

**Example:**
```typescript
const logger = LoggerFactory.createLogger('OrderService');

logger.info('Processing order'); // Context: 'OrderService'
logger.error('Order failed', error); // Context: 'OrderService'
```

### `getBaseLogger(): CustomLogger`

Gets the base logger instance (singleton).

**Returns:** The base `CustomLogger` instance

**Example:**
```typescript
const baseLogger = LoggerFactory.getBaseLogger();
baseLogger.setContext('Global');
```

## ContextBoundLogger

The logger returned by `createLogger()` is a context-bound logger with an immutable context.

### Methods

All logging methods are available with the same signatures as `CustomLogger`:

- `log(message: string, context?: string): void`
- `info(message: string, meta?: Record<string, unknown>, context?: LogContext): void`
- `error(message: string, error?: Error | unknown, context?: LogContext): void`
- `warn(message: string, meta?: Record<string, unknown>, context?: LogContext): void`
- `debug(message: string, meta?: Record<string, unknown>, context?: LogContext): void`
- `getContext(): string` - Returns the bound context

### Immutable Context

The context is set when the logger is created and cannot be changed:

```typescript
const logger = LoggerFactory.createLogger('MyService');

logger.setContext('OtherService'); // Does nothing - context remains 'MyService'
logger.getContext(); // Returns 'MyService'
```

## Use Cases

### Service-Level Logging

```typescript
@Injectable()
export class UserService {
  private readonly logger = LoggerFactory.createLogger('UserService');

  async createUser(data: CreateUserDto) {
    this.logger.info('Creating user', { email: data.email });
    // All logs automatically include 'UserService' context
  }
}
```

### Multiple Loggers

```typescript
@Injectable()
export class ComplexService {
  private readonly logger = LoggerFactory.createLogger('ComplexService');
  private readonly auditLogger = LoggerFactory.createLogger('Audit');

  performAction() {
    this.logger.info('Action performed'); // Context: 'ComplexService'
    this.auditLogger.info('Action audited'); // Context: 'Audit'
  }
}
```

### Class Property Initialization

```typescript
export class MyClass {
  private readonly logger = LoggerFactory.createLogger('MyClass');

  constructor() {
    // Logger is ready to use
    this.logger.debug('Class instantiated');
  }
}
```

## Benefits

- **Immutability** - Context cannot be accidentally changed
- **Type Safety** - Full TypeScript support
- **Convenience** - No need to call `setContext()` repeatedly
- **Consistency** - All logs from a service have the same context

## See Also

- [CustomLogger](/api/custom-logger) - Base logger service
- [Context Logging](/advanced/context-logging) - Advanced context patterns
- [Examples](/guide/examples) - Usage examples

