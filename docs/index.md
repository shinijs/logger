---
layout: home

hero:
  name: "@shinijs/logger"
  text: "Structured Logger for NestJS"
  tagline: Pino-based logger with file rotation and pretty printing
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/shinijs/logger

features:
  - icon: ⚡
    title: Fast & Lightweight
    details: Built on Pino, one of the fastest Node.js loggers with minimal overhead
  - icon: 🎨
    title: Pretty Printing
    details: Beautiful console output in development with colorized, formatted logs
  - icon: 📁
    title: File Rotation
    details: Automatic daily log file rotation for production environments
  - icon: 🔧
    title: Fully Configurable
    details: Environment-based configuration with sensible defaults
  - icon: 📦
    title: NestJS Integration
    details: Seamless integration with NestJS ecosystem and dependency injection
  - icon: 🎯
    title: Context Support
    details: Scoped logging with context for better debugging and tracing
---

## Quick Start

```bash
pnpm add @shinijs/logger pino pino-pretty
```

```typescript
import { LoggerModule } from '@shinijs/logger';

@Module({
  imports: [LoggerModule],
})
export class AppModule {}
```

## Installation

See the [Installation Guide](/guide/getting-started) for detailed setup instructions.

## Features

- ✅ **Pino-based** - Fast, low-overhead structured logging
- ✅ **NestJS Integration** - Seamless integration with NestJS ecosystem
- ✅ **Pretty Printing** - Beautiful console output in development
- ✅ **File Rotation** - Automatic daily log file rotation
- ✅ **Configurable** - Environment-based configuration
- ✅ **TypeScript** - Full type safety
- ✅ **Context Support** - Scoped logging with context

## Documentation

- [Getting Started](/guide/getting-started) - Installation and basic usage
- [Configuration](/guide/configuration) - Environment variables and options
- [API Reference](/api/logger-module) - Complete API documentation
- [Examples](/guide/examples) - Usage examples and patterns
- [Best Practices](/advanced/best-practices) - Production recommendations

