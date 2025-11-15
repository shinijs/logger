# Best Practices

Production-ready recommendations for using `@shinijs/logger`.

## Performance

### Log Level Configuration

Use appropriate log levels in production:

```bash
# Production - only important messages
LOG_LEVEL=info

# Development - verbose logging
LOG_LEVEL=debug

# Troubleshooting - very detailed
LOG_LEVEL=trace
```

### Avoid Expensive Operations

Don't perform expensive operations in log statements:

```typescript
// ❌ Bad - expensive operation always executed
this.logger.debug('Data', { data: await expensiveOperation() });

// ✅ Good - conditional execution
if (this.logger.getContext() === 'Development') {
  this.logger.debug('Data', { data: await expensiveOperation() });
}
```

### Structured Logging

Use structured logging for better performance and searchability:

```typescript
// ❌ Bad - string concatenation
this.logger.info(`User ${userId} created order ${orderId}`);

// ✅ Good - structured data
this.logger.info('Order created', {
  userId,
  orderId,
  timestamp: Date.now(),
});
```

## Error Handling

### Always Log Errors

```typescript
try {
  await riskyOperation();
} catch (error) {
  // ✅ Always log errors with context
  this.logger.error('Operation failed', error, {
    operation: 'riskyOperation',
    userId: currentUser.id,
  });
  throw error;
}
```

### Include Stack Traces

The logger automatically includes stack traces for Error objects:

```typescript
try {
  await operation();
} catch (error) {
  // Stack trace is automatically included
  this.logger.error('Operation failed', error);
}
```

### Error Context

Provide context for errors:

```typescript
this.logger.error('Payment failed', paymentError, {
  userId: user.id,
  amount: payment.amount,
  paymentMethod: payment.method,
  requestId: request.id,
});
```

## Context Management

### Set Context Early

Set context in the constructor:

```typescript
@Injectable()
export class MyService {
  constructor(private readonly logger: CustomLogger) {
    // ✅ Set context immediately
    this.logger.setContext('MyService');
  }
}
```

### Use Context-Bound Loggers

For services, prefer context-bound loggers:

```typescript
@Injectable()
export class MyService {
  // ✅ Immutable context
  private readonly logger = LoggerFactory.createLogger('MyService');
}
```

### Request Context

Set request-level context in middleware:

```typescript
use(req: Request, res: Response, next: NextFunction) {
  const requestId = generateRequestId();
  this.logger.setContext(`Request-${requestId}`);
  next();
}
```

## Production Configuration

### Recommended Settings

```bash
# Production
NODE_ENV=production
LOG_LEVEL=info
LOG_PRETTY_PRINT=false
LOG_FILE_ENABLED=true
LOG_FILE_PATH=/var/log/myapp
```

### File Logging

Enable file logging in production:

```bash
LOG_FILE_ENABLED=true
LOG_FILE_PATH=/var/log/myapp
```

### Log Rotation

Implement log rotation to prevent disk space issues:

```bash
# Keep last 30 days
find /var/log/myapp -name "app-*.log" -mtime +30 -delete
```

## Security

### Don't Log Sensitive Data

```typescript
// ❌ Bad - logging passwords
this.logger.info('User login', { password: user.password });

// ✅ Good - exclude sensitive data
this.logger.info('User login', {
  userId: user.id,
  email: user.email,
  // password excluded
});
```

### Sanitize User Input

Be careful when logging user-provided data:

```typescript
// Sanitize before logging
const sanitizedData = sanitize(userInput);
this.logger.info('User input', { data: sanitizedData });
```

## Monitoring

### Use Appropriate Log Levels

- `error` - For errors that need attention
- `warn` - For warnings that might need attention
- `info` - For important events
- `debug` - For debugging information
- `trace` - For very detailed tracing

### Structured Metadata

Include relevant metadata:

```typescript
this.logger.info('Order created', {
  orderId: order.id,
  userId: order.userId,
  amount: order.amount,
  currency: order.currency,
  timestamp: order.createdAt,
});
```

## Testing

### Mock Loggers in Tests

```typescript
const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  setContext: jest.fn(),
  getContext: jest.fn(),
};

// Use mock logger in tests
const service = new MyService(mockLogger);
```

### Verify Logging

```typescript
it('should log errors', async () => {
  await service.riskyOperation();
  expect(mockLogger.error).toHaveBeenCalledWith(
    'Operation failed',
    expect.any(Error),
    expect.any(Object),
  );
});
```

## Common Patterns

### Request Logging Middleware

```typescript
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: CustomLogger) {
    this.logger.setContext('HTTP');
  }

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const level = res.statusCode >= 400 ? 'error' : 'info';

      this.logger[level]('HTTP Request', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        ip: req.ip,
      });
    });

    next();
  }
}
```

### Async Operation Logging

```typescript
async function loggedOperation(operation: string) {
  const start = Date.now();
  this.logger.debug('Operation started', { operation });

  try {
    const result = await doWork();
    const duration = Date.now() - start;
    this.logger.info('Operation completed', { operation, duration });
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    this.logger.error('Operation failed', error, { operation, duration });
    throw error;
  }
}
```

## See Also

- [Configuration Guide](/guide/configuration) - Configuration options
- [File Rotation](/advanced/file-rotation) - File logging details
- [Context Logging](/advanced/context-logging) - Context patterns

