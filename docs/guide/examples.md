# Examples

Real-world usage examples for `@shinijs/logger`.

## Basic Logging

### Using Dependency Injection

```typescript
import { Injectable } from '@nestjs/common';
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
      this.logger.error('Failed to create user', error, { email: data.email });
      throw error;
    }
  }
}
```

### Using Logger Factory

```typescript
import { Injectable } from '@nestjs/common';
import { LoggerFactory } from '@shinijs/logger';

@Injectable()
export class OrderService {
  private readonly logger = LoggerFactory.createLogger('OrderService');

  async processOrder(orderId: string) {
    this.logger.info('Processing order', { orderId });
    
    // ... your logic
    
    this.logger.info('Order processed successfully', { orderId });
  }
}
```

## Structured Logging

Add metadata to your logs for better observability:

```typescript
this.logger.info('Request processed', {
  method: 'POST',
  path: '/api/users',
  statusCode: 201,
  duration: 45,
  userId: '123',
});
```

## Error Logging

### With Error Object

```typescript
try {
  await someOperation();
} catch (error) {
  this.logger.error('Operation failed', error, {
    operation: 'someOperation',
    userId: currentUser.id,
  });
}
```

### With Custom Context

```typescript
this.logger.error('Payment failed', {
  requestId: 'req-123',
  userId: 'user-456',
  amount: 100.00,
  reason: 'Insufficient funds',
});
```

## Context Logging

### Setting Context

```typescript
@Injectable()
export class PaymentService {
  constructor(private readonly logger: CustomLogger) {
    this.logger.setContext('PaymentService');
  }

  processPayment(paymentId: string) {
    // All logs will include 'PaymentService' as context
    this.logger.info('Processing payment', { paymentId });
  }
}
```

### Context-Bound Logger

```typescript
@Injectable()
export class NotificationService {
  private readonly logger = LoggerFactory.createLogger('NotificationService');

  sendEmail(userId: string) {
    // Context is automatically 'NotificationService'
    this.logger.debug('Sending email', { userId });
  }
}
```

## Request Logging Middleware

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLogger } from '@shinijs/logger';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: CustomLogger) {
    this.logger.setContext('HTTP');
  }

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      
      this.logger.info('HTTP Request', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });
    });

    next();
  }
}
```

## Log Levels

### Debug Logging

```typescript
this.logger.debug('Processing step 1', { step: 1, data: someData });
this.logger.debug('Processing step 2', { step: 2, result: result });
```

### Warning Logging

```typescript
this.logger.warn('Rate limit approaching', {
  current: 90,
  limit: 100,
  resetAt: resetTime,
});
```

### Fatal Logging

```typescript
this.logger.fatal('Application cannot start', {
  reason: 'Database connection failed',
  error: connectionError,
});
```

## Performance Logging

```typescript
async function expensiveOperation() {
  const start = Date.now();
  
  try {
    const result = await doWork();
    const duration = Date.now() - start;
    
    this.logger.info('Operation completed', {
      operation: 'expensiveOperation',
      duration,
      resultSize: result.length,
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    this.logger.error('Operation failed', error, {
      operation: 'expensiveOperation',
      duration,
    });
    throw error;
  }
}
```

## Conditional Logging

```typescript
if (this.logger.getContext() === 'Development') {
  this.logger.debug('Detailed debug info', { internalState });
}

// Or check log level before expensive operations
if (process.env.LOG_LEVEL === 'debug') {
  const debugData = await gatherDebugData();
  this.logger.debug('Debug data', debugData);
}
```

## Multiple Loggers

```typescript
@Injectable()
export class ComplexService {
  private readonly logger = LoggerFactory.createLogger('ComplexService');
  private readonly auditLogger = LoggerFactory.createLogger('Audit');

  async performAction(userId: string, action: string) {
    // Regular logging
    this.logger.info('Performing action', { userId, action });

    // Audit logging
    this.auditLogger.info('User action', {
      userId,
      action,
      timestamp: new Date().toISOString(),
    });
  }
}
```

## See Also

- [API Reference](/api/custom-logger) - Complete API documentation
- [Best Practices](/advanced/best-practices) - Production recommendations
- [Context Logging](/advanced/context-logging) - Advanced context patterns

