---
"@shinijs/logger": patch
---

Fix file logging to work when pretty printing is enabled. Previously, file logging was only available when prettyPrint was disabled (production mode). Now file logging works in both development (with pretty console output) and production modes simultaneously.

