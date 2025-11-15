# File Rotation

How file logging and rotation works in `@shinijs/logger`.

## Overview

When file logging is enabled, the logger automatically writes logs to files with daily rotation. This ensures:

- Logs are persisted for analysis
- Files don't grow indefinitely
- Old logs are automatically managed
- Easy log file organization

## Enabling File Logging

Set the `LOG_FILE_ENABLED` environment variable:

```bash
LOG_FILE_ENABLED=true
LOG_FILE_PATH=./logs
```

Or configure programmatically:

```typescript
// Via environment
process.env.LOG_FILE_ENABLED = 'true';
process.env.LOG_FILE_PATH = './logs';
```

## File Naming

Log files are named using the pattern:

```
app-YYYY-MM-DD.log
```

**Example:**
- `app-2025-01-15.log` - Logs for January 15, 2025
- `app-2025-01-16.log` - Logs for January 16, 2025

## File Location

Files are stored in the directory specified by `LOG_FILE_PATH`:

```bash
LOG_FILE_PATH=./logs        # Relative path
LOG_FILE_PATH=/var/log/app  # Absolute path
```

## Automatic Directory Creation

If the log directory doesn't exist, it will be created automatically:

```typescript
// Directory is created if it doesn't exist
if (!existsSync(logDir)) {
  mkdirSync(logDir, { recursive: true });
}
```

## Rotation Behavior

### Daily Rotation

- A new log file is created each day
- Logs are written to the current day's file
- Previous day's files remain available

### File Format

Logs are written in JSON format (Pino's default):

```json
{"level":30,"time":1699999999,"context":"UserService","msg":"User created","userId":"123"}
{"level":30,"time":1700000000,"context":"UserService","msg":"User updated","userId":"123"}
```

## Configuration

### Basic Configuration

```bash
LOG_FILE_ENABLED=true
LOG_FILE_PATH=./logs
```

### Production Configuration

```bash
LOG_FILE_ENABLED=true
LOG_FILE_PATH=/var/log/myapp
LOG_LEVEL=info
```

### Development Configuration

```bash
LOG_FILE_ENABLED=true
LOG_FILE_PATH=./logs
LOG_LEVEL=debug
LOG_PRETTY_PRINT=true  # Console still uses pretty print
```

## File Management

### Manual Cleanup

You may want to implement log rotation or cleanup:

```bash
# Keep only last 30 days
find ./logs -name "app-*.log" -mtime +30 -delete
```

### Using logrotate (Linux)

Create `/etc/logrotate.d/myapp`:

```
/var/log/myapp/app-*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 app app
}
```

## Reading Log Files

### Using jq

```bash
# Pretty print JSON logs
cat app-2025-01-15.log | jq '.'

# Filter by level
cat app-2025-01-15.log | jq 'select(.level >= 40)'

# Filter by context
cat app-2025-01-15.log | jq 'select(.context == "UserService")'
```

### Using pino-pretty

```bash
# Pretty print logs
cat app-2025-01-15.log | pino-pretty
```

## Best Practices

### Production

1. **Use absolute paths** for reliability:
   ```bash
   LOG_FILE_PATH=/var/log/myapp
   ```

2. **Set appropriate permissions**:
   ```bash
   chmod 755 /var/log/myapp
   ```

3. **Implement log rotation** to prevent disk space issues

4. **Monitor disk usage** for log directories

### Development

1. **Use relative paths** for convenience:
   ```bash
   LOG_FILE_PATH=./logs
   ```

2. **Add to .gitignore**:
   ```
   logs/
   *.log
   ```

## Troubleshooting

### Files Not Created

- Check `LOG_FILE_ENABLED` is set to `true`
- Verify directory permissions
- Check disk space

### Permission Errors

```bash
# Fix permissions
chmod 755 /var/log/myapp
chown app:app /var/log/myapp
```

### Disk Space Issues

- Implement log rotation
- Monitor log directory size
- Set up alerts for disk usage

## See Also

- [Configuration Guide](/guide/configuration) - Configuration options
- [Best Practices](/advanced/best-practices) - Production recommendations

