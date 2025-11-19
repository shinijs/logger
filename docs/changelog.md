# Changelog

All notable changes to `@shinijs/logger` are documented here.

This project follows [Semantic Versioning](https://semver.org/) and uses [Changesets](https://github.com/changesets/changesets) for version management.

---

## 1.2.0

### Minor Changes

- 1e5da39: Add automatic log file rotation with configurable time-based and size-based strategies.

  **Features:**
  - Automatic daily log file rotation by default when file logging is enabled
  - Configurable rotation frequency (daily, hourly, or custom intervals)
  - Automatic cleanup of old log files based on retention policy (default: 7 files)
  - Size-based rotation with configurable file size limits (default: 10MB)
  - Custom date patterns for log file naming
  - Full backward compatibility - existing configurations work without changes
  - Seamless integration with pretty printing and multi-stream logging
  - Uses official `pino-roll` transport for reliable rotation

  **New Environment Variables:**
  - `LOG_FILE_ROTATION_ENABLED` - Enable/disable rotation (default: true when file logging enabled)
  - `LOG_FILE_ROTATION_FREQUENCY` - Rotation frequency: 'daily', 'hourly', or 'custom' (default: 'daily')
  - `LOG_FILE_ROTATION_PATTERN` - Date pattern for filenames (default: 'YYYY-MM-DD')
  - `LOG_FILE_MAX_FILES` - Number of log files to retain (default: 7)
  - `LOG_FILE_SIZE_LIMIT` - Maximum file size before rotation (default: '10M')

  **File Naming:**
  - Daily rotation: `app-2024-01-15.log`
  - Hourly rotation: `app-2024-01-15-14.log`
  - No rotation: `app.log` (when explicitly disabled)

  **Breaking Changes:**
  None - this is a backward compatible enhancement. Existing users will automatically get daily rotation enabled, but can disable it with `LOG_FILE_ROTATION_ENABLED=false` to maintain the previous single-file behavior.

  **Migration:**
  No migration needed for most users. If you prefer the old single-file behavior, set `LOG_FILE_ROTATION_ENABLED=false` in your environment variables.

  **New Peer Dependency:**
  - `pino-roll: ^4.0.0` - Install with: `pnpm add pino-roll`

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
