---
"@shinijs/logger": minor
---

Add file logging support with pretty printing enabled and NestJS LoggerService compatibility.

**Features:**
- File logging now works when pretty printing is enabled (development mode)
- ContextBoundLogger now implements LoggerService for NestJS compatibility
- Added method overloads to support both ILogger and LoggerService signatures
- Fixed warn() method to properly handle single-argument calls from NestJS LoggerService

**Breaking Changes:**
None - this is a backward compatible enhancement.

**Migration:**
No migration needed. Existing code continues to work. ContextBoundLogger can now be used wherever LoggerService is expected (e.g., in RateLimitModule.forRoot()).

