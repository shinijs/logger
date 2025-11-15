# Context Logging

Advanced patterns for using context in your logs.

## Overview

Context logging helps you identify where log messages originate and provides additional metadata for debugging and tracing.

## Context Types

### String Context

Simple context name:

```typescript
this.logger.setContext('UserService');
this.logger.info('User created'); // Context: 'UserService'
```

### Rich Context Object

Detailed context with multiple fields:

```typescript
this.logger.info('Request processed', {}, {
  requestId: 'req-123',
  userId: 'user-456',
  method: 'POST',
  url: '/api/users',
  statusCode: 201,
  responseTime: 45,
});
```

## Patterns

### Service-Level Context

Set context once per service:

```typescript
@Injectable()
export class UserService {
  constructor(private readonly logger: CustomLogger) {
    this.logger.setContext('UserService');
  }

  async createUser(data: CreateUserDto) {
    // All logs automatically include 'UserService' context
    this.logger.info('Creating user', { email: data.email });
  }
}
```

### Context-Bound Logger

Use `LoggerFactory` for immutable context:

```typescript
@Injectable()
export class OrderService {
  private readonly logger = LoggerFactory.createLogger('OrderService');

  processOrder() {
    // Context is always 'OrderService'
    this.logger.info('Processing order');
  }
}
```

### Request-Level Context

Set context per request:

```typescript
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: CustomLogger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const requestId = generateRequestId();
    
    // Set context for this request
    this.logger.setContext(`Request-${requestId}`);
    
    res.on('finish', () => {
      this.logger.info('Request completed', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
      });
    });

    next();
  }
}
```

### Method-Level Context

Override context for specific methods:

```typescript
async createUser(data: CreateUserDto) {
  this.logger.info('Creating user', {}, 'UserService.createUser');
  // ... implementation
}
```

## Advanced Patterns

### Request Tracing

```typescript
@Injectable()
export class TracingService {
  constructor(private readonly logger: CustomLogger) {}

  async processRequest(requestId: string, userId: string) {
    const context = {
      requestId,
      userId,
      timestamp: Date.now(),
    };

    this.logger.info('Request started', {}, context);
    
    try {
      const result = await this.doWork();
      this.logger.info('Request completed', { result }, context);
      return result;
    } catch (error) {
      this.logger.error('Request failed', error, context);
      throw error;
    }
  }
}
```

### User Activity Logging

```typescript
@Injectable()
export class AuditService {
  constructor(private readonly logger: CustomLogger) {}

  logUserAction(userId: string, action: string, details: Record<string, unknown>) {
    this.logger.info('User action', details, {
      userId,
      action,
      timestamp: new Date().toISOString(),
      ip: this.getClientIp(),
    });
  }
}
```

### Performance Monitoring

```typescript
async function monitoredOperation() {
  const startTime = Date.now();
  const context = {
    operation: 'monitoredOperation',
    startTime,
  };

  this.logger.debug('Operation started', {}, context);

  try {
    const result = await doWork();
    const duration = Date.now() - startTime;
    
    this.logger.info('Operation completed', {
      duration,
      resultSize: result.length,
    }, context);
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    this.logger.error('Operation failed', error, {
      ...context,
      duration,
    });
    throw error;
  }
}
```

### Multi-Context Logging

Use multiple loggers for different purposes:

```typescript
@Injectable()
export class ComplexService {
  private readonly logger = LoggerFactory.createLogger('ComplexService');
  private readonly auditLogger = LoggerFactory.createLogger('Audit');
  private readonly perfLogger = LoggerFactory.createLogger('Performance');

  async performAction(userId: string) {
    // Regular logging
    this.logger.info('Performing action', { userId });

    // Audit logging
    this.auditLogger.info('User action', {
      userId,
      action: 'performAction',
      timestamp: new Date().toISOString(),
    });

    // Performance logging
    const start = Date.now();
    await this.doWork();
    const duration = Date.now() - start;
    this.perfLogger.info('Action performance', { userId, duration });
  }
}
```

## Best Practices

1. **Use descriptive context names** - Make it easy to identify the source
2. **Be consistent** - Use the same context naming pattern throughout
3. **Include request IDs** - For tracing requests across services
4. **Add user context** - When available, include user information
5. **Use rich context objects** - For complex scenarios with multiple fields

## See Also

- [CustomLogger API](/api/custom-logger) - Logger methods
- [LoggerFactory API](/api/logger-factory) - Context-bound loggers
- [Best Practices](/advanced/best-practices) - Production recommendations

