# File Rotation

Advanced guide to log file rotation in `@shinijs/logger`.

## Overview

Log file rotation automatically creates new log files based on time or size criteria, preventing single files from growing indefinitely and making log management easier. The logger uses the official `pino-roll` transport to provide robust, production-ready rotation.

## Rotation Strategies

### Time-Based Rotation

Time-based rotation creates new log files at regular intervals, making it easy to organize logs by date.

#### Daily Rotation (Default)

Creates a new log file each day:

```bash
LOG_FILE_ENABLED=true
LOG_FILE_PATH=./logs
LOG_FILE_ROTATION_FREQUENCY=daily
```

**File naming:**
```
logs/
├── app-2024-01-15.log  # Today
├── app-2024-01-14.log  # Yesterday
├── app-2024-01-13.log
└── app-2024-01-12.log
```

**Best for:**
- Most applications
- Daily log review workflows
- Compliance requirements with daily retention

#### Hourly Rotation

Creates a new log file each hour:

```bash
LOG_FILE_ENABLED=true
LOG_FILE_PATH=./logs
LOG_FILE_ROTATION_FREQUENCY=hourly
LOG_FILE_ROTATION_PATTERN=YYYY-MM-DD-HH
```

**File naming:**
```
logs/
├── app-2024-01-15-14.log  # 2 PM
├── app-2024-01-15-13.log  # 1 PM
├── app-2024-01-15-12.log  # 12 PM
└── app-2024-01-15-11.log  # 11 AM
```

**Best for:**
- High-volume applications
- Real-time monitoring
- Granular log analysis

#### Custom Intervals

Use custom patterns for specific needs:

```bash
# Monthly rotation
LOG_FILE_ROTATION_FREQUENCY=custom
LOG_FILE_ROTATION_PATTERN=YYYY-MM

# Weekly rotation (by week number)
LOG_FILE_ROTATION_FREQUENCY=custom
LOG_FILE_ROTATION_PATTERN=YYYY-[W]WW
```

### Size-Based Rotation

Size-based rotation creates new files when the current file reaches a size limit:

```bash
LOG_FILE_ENABLED=true
LOG_FILE_PATH=./logs
LOG_FILE_SIZE_LIMIT=50M  # Rotate at 50 megabytes
```

**Size formats:**
- `10M` - 10 megabytes
- `100K` - 100 kilobytes
- `1G` - 1 gigabyte

**Best for:**
- Predictable file sizes
- Storage-constrained environments
- Applications with variable log volume

### Combined Strategy

Use both time and size limits:

```bash
LOG_FILE_ENABLED=true
LOG_FILE_ROTATION_FREQUENCY=daily
LOG_FILE_SIZE_LIMIT=100M
```

Files rotate when **either** condition is met:
- A new day begins, OR
- File size exceeds 100MB

**Best for:**
- Production environments
- Unpredictable log volumes
- Maximum flexibility

## Configuration Examples

### Development Environment

Verbose logging with daily rotation:

```bash
NODE_ENV=development
LOG_LEVEL=debug
LOG_PRETTY_PRINT=true
LOG_FILE_ENABLED=true
LOG_FILE_PATH=./logs
LOG_FILE_ROTATION_FREQUENCY=daily
LOG_FILE_MAX_FILES=3  # Keep only 3 days
```

### Production Environment

Optimized for performance and storage:

```bash
NODE_ENV=production
LOG_LEVEL=info
LOG_PRETTY_PRINT=false
LOG_FILE_ENABLED=true
LOG_FILE_PATH=/var/log/myapp
LOG_FILE_ROTATION_FREQUENCY=daily
LOG_FILE_SIZE_LIMIT=100M
LOG_FILE_MAX_FILES=30  # Keep 30 days
```

### High-Volume Application

Hourly rotation with size limits:

```bash
LOG_LEVEL=info
LOG_FILE_ENABLED=true
LOG_FILE_PATH=/var/log/myapp
LOG_FILE_ROTATION_FREQUENCY=hourly
LOG_FILE_ROTATION_PATTERN=YYYY-MM-DD-HH
LOG_FILE_SIZE_LIMIT=50M
LOG_FILE_MAX_FILES=168  # Keep 7 days (24 * 7)
```

### Microservice with Limited Storage

Aggressive cleanup with small files:

```bash
LOG_FILE_ENABLED=true
LOG_FILE_PATH=/var/log/service
LOG_FILE_ROTATION_FREQUENCY=daily
LOG_FILE_SIZE_LIMIT=10M
LOG_FILE_MAX_FILES=3  # Keep only 3 days
```

### Compliance-Driven Retention

Long retention period:

```bash
LOG_FILE_ENABLED=true
LOG_FILE_PATH=/var/log/audit
LOG_FILE_ROTATION_FREQUENCY=daily
LOG_FILE_MAX_FILES=365  # Keep 1 year
```

### Disabled Rotation

Single file logging (legacy behavior):

```bash
LOG_FILE_ENABLED=true
LOG_FILE_ROTATION_ENABLED=false
LOG_FILE_PATH=./logs
# Creates: logs/app.log (single file)
```

## File Naming Patterns

### Pattern Syntax

The `LOG_FILE_ROTATION_PATTERN` uses date-fns format tokens:

| Token | Description | Example |
|-------|-------------|---------|
| `YYYY` | 4-digit year | 2024 |
| `MM` | 2-digit month | 01 |
| `DD` | 2-digit day | 15 |
| `HH` | 2-digit hour (24h) | 14 |
| `mm` | 2-digit minute | 30 |
| `ss` | 2-digit second | 45 |
| `WW` | Week number | 03 |

### Common Patterns

```bash
# Daily: app-2024-01-15.log
LOG_FILE_ROTATION_PATTERN=YYYY-MM-DD

# Hourly: app-2024-01-15-14.log
LOG_FILE_ROTATION_PATTERN=YYYY-MM-DD-HH

# Monthly: app-2024-01.log
LOG_FILE_ROTATION_PATTERN=YYYY-MM

# With time: app-2024-01-15_14-30.log
LOG_FILE_ROTATION_PATTERN=YYYY-MM-DD_HH-mm

# ISO format: app-20240115.log
LOG_FILE_ROTATION_PATTERN=YYYYMMDD
```

### Custom Base Name

The base filename is always `app`. Files are named as:
```
{base}-{pattern}.log
```

For example, with pattern `YYYY-MM-DD`:
```
app-2024-01-15.log
```

## Retention Policies

### Automatic Cleanup

The logger automatically deletes old files when the count exceeds `LOG_FILE_MAX_FILES`:

```bash
LOG_FILE_MAX_FILES=7  # Keep last 7 files
```

**How it works:**
1. New log file is created
2. Logger counts existing log files
3. If count > maxFiles, oldest files are deleted
4. Deletion happens automatically, no manual intervention

### Calculating Retention

**Daily rotation:**
```bash
LOG_FILE_MAX_FILES=30  # 30 days of logs
```

**Hourly rotation:**
```bash
LOG_FILE_MAX_FILES=168  # 7 days (24 hours × 7 days)
```

**Size-based (approximate):**
```bash
LOG_FILE_SIZE_LIMIT=10M
LOG_FILE_MAX_FILES=10  # ~100MB total
```

### External Cleanup

For additional cleanup beyond automatic rotation:

```bash
# Delete logs older than 90 days
find /var/log/myapp -name "app-*.log" -mtime +90 -delete

# Compress old logs
find /var/log/myapp -name "app-*.log" -mtime +7 -exec gzip {} \;

# Archive to S3 (example)
aws s3 sync /var/log/myapp s3://my-logs-bucket/ --exclude "app-$(date +%Y-%m-%d).log"
```

### Cron Jobs

Automate external cleanup:

```cron
# Daily cleanup at 2 AM
0 2 * * * find /var/log/myapp -name "app-*.log" -mtime +90 -delete

# Weekly compression on Sundays at 3 AM
0 3 * * 0 find /var/log/myapp -name "app-*.log" -mtime +7 -exec gzip {} \;
```

## Integration with Pretty Printing

### Development Setup

Pretty console output + rotated file logs:

```bash
LOG_PRETTY_PRINT=true
LOG_FILE_ENABLED=true
LOG_FILE_ROTATION_FREQUENCY=daily
```

**Behavior:**
- Console: Human-readable formatted output (via pino-pretty)
- Files: JSON structured logs (via pino-roll)

### Multi-Stream Configuration

The logger automatically configures multi-stream when both are enabled:

```typescript
// Automatically configured
{
  transport: {
    targets: [
      { target: 'pino-pretty', options: { ... } },  // Console
      { target: 'pino-roll', options: { ... } }     // Files
    ]
  }
}
```

### Performance Impact

- Each transport runs in a separate worker thread
- No blocking of main application thread
- Minimal performance overhead
- File rotation happens asynchronously

## Troubleshooting

### Files Not Rotating

**Symptom:** Only `app.log` exists, no dated files

**Causes:**
1. Rotation is disabled
2. Not enough time has passed
3. Configuration error

**Solutions:**

```bash
# Check rotation is enabled
LOG_FILE_ROTATION_ENABLED=true

# Verify frequency setting
LOG_FILE_ROTATION_FREQUENCY=daily  # or hourly

# Check file path exists
ls -la /var/log/myapp

# Review application logs for errors
grep -i "rotation" /var/log/myapp/app*.log
```

### Permission Errors

**Symptom:** Errors about file permissions

**Causes:**
- Application user lacks write permissions
- Directory doesn't exist
- SELinux or AppArmor restrictions

**Solutions:**

```bash
# Create directory with correct permissions
mkdir -p /var/log/myapp
chown myapp:myapp /var/log/myapp
chmod 755 /var/log/myapp

# Check current permissions
ls -la /var/log/myapp

# Verify application user
ps aux | grep node
```

### Disk Space Issues

**Symptom:** Application crashes or rotation stops

**Causes:**
- Disk full
- Too many log files
- Files not being cleaned up

**Solutions:**

```bash
# Check disk space
df -h /var/log

# Count log files
ls -1 /var/log/myapp/app-*.log | wc -l

# Reduce retention
LOG_FILE_MAX_FILES=7  # Keep fewer files

# Reduce file size
LOG_FILE_SIZE_LIMIT=10M  # Smaller files

# Manual cleanup
find /var/log/myapp -name "app-*.log" -mtime +30 -delete
```

### Files Not Being Deleted

**Symptom:** More files than `LOG_FILE_MAX_FILES`

**Causes:**
- External processes creating files
- Incorrect file naming pattern
- pino-roll not managing cleanup

**Solutions:**

```bash
# Verify file naming matches pattern
ls -la /var/log/myapp/

# Check for external log files
find /var/log/myapp -name "*.log" -not -name "app-*.log"

# Manual cleanup
find /var/log/myapp -name "app-*.log" | sort | head -n -7 | xargs rm

# Set up cron job for backup cleanup
0 2 * * * find /var/log/myapp -name "app-*.log" | sort | head -n -7 | xargs rm
```

### Missing pino-roll Dependency

**Symptom:** Error: Cannot find module 'pino-roll'

**Cause:** pino-roll peer dependency not installed

**Solution:**

```bash
# Install peer dependency
npm install pino-roll
# or
pnpm add pino-roll
# or
yarn add pino-roll
```

### Rotation During High Load

**Symptom:** Logs missing during rotation

**Cause:** Buffer not flushed before rotation

**Solution:**

This is handled automatically by pino-roll, but you can:

```bash
# Increase buffer size (if needed)
# Note: This is a pino-roll internal setting
# Usually not necessary to configure

# Monitor for dropped logs
grep -i "buffer" /var/log/myapp/app*.log
```

### Time Zone Issues

**Symptom:** Files rotate at unexpected times

**Cause:** Server time zone mismatch

**Solution:**

```bash
# Check server time zone
date
timedatectl

# Set time zone
timedatectl set-timezone America/New_York

# Use UTC for consistency
timedatectl set-timezone UTC

# Verify in logs
ls -lt /var/log/myapp/
```

## Monitoring and Alerts

### Log File Metrics

Monitor these metrics:

```bash
# Current log file size
du -h /var/log/myapp/app-$(date +%Y-%m-%d).log

# Total log directory size
du -sh /var/log/myapp

# Number of log files
ls -1 /var/log/myapp/app-*.log | wc -l

# Oldest log file
ls -t /var/log/myapp/app-*.log | tail -1
```

### Alerting Examples

**Disk space alert:**
```bash
#!/bin/bash
USAGE=$(df -h /var/log | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $USAGE -gt 80 ]; then
  echo "Log disk usage above 80%: ${USAGE}%"
  # Send alert
fi
```

**File count alert:**
```bash
#!/bin/bash
COUNT=$(ls -1 /var/log/myapp/app-*.log | wc -l)
if [ $COUNT -gt 100 ]; then
  echo "Too many log files: ${COUNT}"
  # Send alert
fi
```

## Best Practices

1. **Use daily rotation by default** - Good balance for most applications
2. **Set appropriate retention** - Match your compliance and debugging needs
3. **Monitor disk space** - Set up alerts before running out
4. **Test rotation** - Verify rotation works in staging before production
5. **Use size limits** - Prevent runaway log growth
6. **Keep recent logs accessible** - Don't over-compress or archive too aggressively
7. **Document your strategy** - Make retention policies clear to your team
8. **Plan for growth** - Estimate log volume and adjust settings accordingly

## See Also

- [Configuration Guide](/guide/configuration) - All configuration options
- [Best Practices](/advanced/best-practices) - Production recommendations
- [API Reference](/api/config) - LoggerConfig interface
