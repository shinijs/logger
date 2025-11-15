# @shinijs/logger

## 1.1.0

### Minor Changes

- f69a385: Add file logging support with pretty printing enabled and NestJS LoggerService compatibility.

  **Features:**
  - File logging now works when pretty printing is enabled (development mode)
  - ContextBoundLogger now implements LoggerService for NestJS compatibility
  - Added method overloads to support both ILogger and LoggerService signatures
  - Fixed warn() method to properly handle single-argument calls from NestJS LoggerService

  **Breaking Changes:**
  None - this is a backward compatible enhancement.

  **Migration:**
  No migration needed. Existing code continues to work. ContextBoundLogger can now be used wherever LoggerService is expected (e.g., in RateLimitModule.forRoot()).

## 1.0.1

### Patch Changes

- 0578d58: Fix file logging to work when pretty printing is enabled. Previously, file logging was only available when prettyPrint was disabled (production mode). Now file logging works in both development (with pretty console output) and production modes simultaneously.

## 1.0.0

### Major Changes

- c01efef: first release

## 1.0.0

### Major Changes

- 309f494: first major release of the package
