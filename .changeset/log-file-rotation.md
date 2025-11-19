---
"@shinijs/logger": minor
---

Add automatic log file rotation with configurable time-based and size-based strategies.

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
